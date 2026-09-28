import type * as api from '../src/lib/api';

export const cliente: api.SessionUser = { id: 'u1', email: 'carlos@test.com', nombre: 'Carlos Martínez', role: 'client', clientId: 'c1' };
export const coach: api.SessionUser = { id: 'u0', email: 'chris@chrisfitness.com', nombre: 'Chris', role: 'admin', clientId: null };

export const block: api.TrainingBlock = {
  id: 'b1', name: 'Bloque Fuerza',
  days: [{
    id: 'd1', day_number: 1, name: 'Push',
    exercises: [{ id: 'te1', sets: 2, reps: '8-10', rir: 2, rest_seconds: 120, tempo: null, trainer_notes: 'Baja controlado',
      exercise: { id: 'e1', name: 'Press banca', video_url: 'https://youtu.be/x', description: null } }],
  }],
};

export const plan: api.NutritionPlan = {
  id: 'p1', name: 'Plan Definición', target_kcal: 2200, target_protein: 170, target_carbs: 220, target_fat: 60,
  meals: [{ id: 'm1', name: 'Desayuno', order_index: 1, options: [
    { id: 'o1', option_number: 1, is_selected: true, foods: [{ id: 'f1', quantity_grams: 80, food: { name: 'Avena', kcal_per_100: 370, protein_per_100: 13, carbs_per_100: 60, fat_per_100: 7 } }] },
    { id: 'o2', option_number: 2, is_selected: false, foods: [{ id: 'f2', quantity_grams: 200, food: { name: 'Yogur griego', kcal_per_100: 100, protein_per_100: 9, carbs_per_100: 4, fat_per_100: 5 } }] },
  ] }],
};

export const checkins: api.CheckinSchedule[] = [{
  id: 's1', day_of_week: new Date().getDay(),
  template: { id: 't1', name: 'Check-in semanal', questions: [{ id: 'q1', label: '¿Cómo has dormido?', type: 'text' }] },
}];

export const clients: api.ClientSummary[] = [
  { id: 'c1', full_name: 'Carlos Martínez', email: 'carlos@test.com', status: 'activo', goal: 'Perder grasa' },
  { id: 'c2', full_name: 'Álvaro Gómez', email: 'alvaro@test.com', status: 'activo', goal: 'Ganar músculo' },
];

export const responses: api.CheckinResponse[] = [
  { id: 'r1', submitted_at: '2026-09-20T10:00:00Z', answers: { '¿Cómo has dormido?': 'Bien' }, clientName: 'Álvaro Gómez', templateName: 'Check-in semanal' },
];

export const exercises: api.Exercise[] = [
  { id: 'e1', name: 'Jalón al pecho', video_url: null, description: null },
  { id: 'e2', name: 'Press banca', video_url: 'https://youtu.be/x', description: 'Barra' },
];
