/** Comprueba que la capa de datos pide lo mismo que la web y normaliza bien las respuestas de Supabase */
type Resp = { data: unknown; error: { message: string } | null };
const calls: { table: string; ops: [string, unknown[]][] }[] = [];
const responses: Record<string, Resp[]> = {};
const mockUpload = jest.fn();

function mockBuilder(table: string) {
  const entry = { table, ops: [] as [string, unknown[]][] };
  calls.push(entry);
  const b: any = new Proxy({}, {
    get(_t, prop: string) {
      if (prop === 'then') {
        const r = responses[table]?.shift() ?? { data: null, error: null };
        return (res: (v: Resp) => void) => res(r);
      }
      return (...args: unknown[]) => { entry.ops.push([prop, args]); return b; };
    },
  });
  return b;
}

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: (t: string) => mockBuilder(t),
    storage: { from: () => ({ upload: (...a: unknown[]) => mockUpload(...a) }) },
    auth: {},
  },
}));

import * as api from '../src/lib/api';

beforeEach(() => { calls.length = 0; for (const k of Object.keys(responses)) delete responses[k]; mockUpload.mockReset(); });

test('fetchActiveBlock: filtra por cliente y bloque activo, ordena días y aplana relaciones', async () => {
  responses.training_blocks = [{ error: null, data: { id: 'b1', name: 'Bloque', training_days: [
    { id: 'd2', day_number: 2, name: null, training_exercises: [] },
    { id: 'd1', day_number: 1, name: 'Push', training_exercises: [
      { id: 'te1', sets: 3, reps: 10, rir: 2, rest_seconds: 90, tempo: null, trainer_notes: null, exercises_library: [{ id: 'e1', name: 'Press', video_url: null, description: null }] },
    ] },
  ] } }];
  const block = await api.fetchActiveBlock('c1');
  expect(calls[0].ops).toEqual(expect.arrayContaining([['eq', ['client_id', 'c1']], ['eq', ['is_active', true]]]));
  expect(block!.days.map(d => d.day_number)).toEqual([1, 2]);
  expect(block!.days[0].exercises[0]).toMatchObject({ reps: '10', exercise: { name: 'Press' } });
});

test('los errores de Supabase se convierten en excepciones legibles', async () => {
  responses.nutrition_plans = [{ data: null, error: { message: 'permission denied' } }];
  await expect(api.fetchActivePlan('c1')).rejects.toThrow('permission denied');
});

test('chooseOption desmarca las opciones de la comida y marca la elegida', async () => {
  await api.chooseOption('o2', 'm1');
  expect(calls.map(c => c.ops)).toEqual([
    [['update', [{ is_selected: false }]], ['eq', ['meal_id', 'm1']]],
    [['update', [{ is_selected: true }]], ['eq', ['id', 'o2']]],
  ]);
});

test('uploadProgressPhoto sube a la carpeta del cliente (lo exige la política de storage) y registra la foto', async () => {
  global.fetch = jest.fn().mockResolvedValue({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)) }) as any;
  mockUpload.mockResolvedValue({ error: null });
  await api.uploadProgressPhoto('c1', 'file:///foto.jpg', 'image/jpeg', 'frontal');
  const [path, , opts] = mockUpload.mock.calls[0];
  expect(path).toMatch(/^c1\/\d+\.jpg$/);
  expect(opts).toEqual({ contentType: 'image/jpeg' });
  const insert = calls.find(c => c.table === 'progress_photos')!.ops[0];
  expect(insert).toEqual(['insert', [{ client_id: 'c1', storage_path: path, photo_type: 'frontal' }]]);
});

test('submitCheckin guarda las respuestas por texto de pregunta, como la web', async () => {
  await api.submitCheckin('c1', 't1', { '¿Energía?': '8' });
  expect(calls[0]).toEqual({ table: 'checkin_responses', ops: [['insert', [{ client_id: 'c1', template_id: 't1', answers: { '¿Energía?': '8' } }]]] });
});

test('optionTotals calcula kcal y macros por gramos', () => {
  const t = api.optionTotals({ id: 'o', option_number: 1, is_selected: true, foods: [
    { id: 'f', quantity_grams: 150, food: { name: 'Arroz', kcal_per_100: 130, protein_per_100: 2.7, carbs_per_100: 28, fat_per_100: 0.3 } },
  ] });
  expect(Math.round(t.kcal)).toBe(195);
  expect(+t.carbs.toFixed(1)).toBe(42);
});
