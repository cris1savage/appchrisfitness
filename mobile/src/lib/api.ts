/**
 * Acceso a datos. Usa las mismas tablas y consultas que la web (src/app/(cliente) y src/app/(app)),
 * así que web y app ven siempre los mismos datos y las mismas reglas de permisos (RLS).
 */
import { supabase } from './supabase';

// ---------- Tipos ----------
export type Role = 'admin' | 'client';
export type SessionUser = { id: string; email: string; nombre: string; role: Role; clientId: string | null };

export type Exercise = { id: string; name: string; video_url: string | null; description: string | null };
export type TrainingExercise = {
  id: string; sets: number | null; reps: string | null; rir: number | null; rest_seconds: number | null;
  tempo: string | null; trainer_notes: string | null; exercise: Exercise | null;
};
export type TrainingDay = { id: string; day_number: number; name: string | null; exercises: TrainingExercise[] };
export type TrainingBlock = { id: string; name: string; days: TrainingDay[] };
export type ExerciseLog = { training_exercise_id: string; logged_at: string; weight: number | null; reps: number | null };

export type Food = { name: string; kcal_per_100: number; protein_per_100: number; carbs_per_100: number; fat_per_100: number };
export type OptionFood = { id: string; quantity_grams: number; food: Food | null };
export type MealOption = { id: string; option_number: number; is_selected: boolean; foods: OptionFood[] };
export type Meal = { id: string; name: string; order_index: number; options: MealOption[] };
export type NutritionPlan = {
  id: string; name: string; target_kcal: number | null; target_protein: number | null;
  target_carbs: number | null; target_fat: number | null; meals: Meal[];
};

export type WeightGoal = { start_weight: number; target_weight: number; start_date: string | null; target_date: string | null };
export type WeightLog = { logged_at: string; weight: number };

export type CheckinQuestion = { id: string; label: string; type: string };
export type CheckinSchedule = { id: string; day_of_week: number; template: { id: string; name: string; questions: CheckinQuestion[] } | null };
export type CheckinResponse = { id: string; submitted_at: string; answers: Record<string, string>; clientName: string; templateName: string };

export type ClientSummary = { id: string; full_name: string; email: string | null; status: string | null; goal: string | null };

// ---------- Utilidades ----------
/** Supabase devuelve las relaciones a veces como objeto y a veces como array */
function one<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}
function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

// ---------- Sesión ----------
export async function getSessionUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) {
    if (/invalid login/i.test(error.message)) throw new Error('Email o contraseña incorrectos');
    throw new Error('No se pudo iniciar sesión. Revisa tu conexión.');
  }
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function onSignedOut(cb: () => void) {
  const { data } = supabase.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') cb(); });
  return () => data.subscription.unsubscribe();
}

/** Perfil + (si es cliente) su ficha de cliente. Igual que /post-login y getMyClientId en la web. */
export async function loadSessionUser(): Promise<SessionUser | null> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  const profile = check(await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle());
  const role: Role = profile?.role === 'admin' ? 'admin' : 'client';

  let clientId: string | null = null;
  let nombre: string = profile?.full_name ?? user.email ?? '';
  if (role === 'client') {
    const client = check(await supabase.from('clients').select('id, full_name').eq('profile_id', user.id).maybeSingle());
    clientId = client?.id ?? null;
    nombre = client?.full_name ?? nombre;
  }
  return { id: user.id, email: user.email ?? '', nombre, role, clientId };
}

// ---------- Cliente: entrenamiento ----------
export async function fetchActiveBlock(clientId: string): Promise<TrainingBlock | null> {
  const block = check(await supabase
    .from('training_blocks')
    .select(`id, name,
      training_days ( id, day_number, name,
        training_exercises ( id, sets, reps, rir, rest_seconds, tempo, trainer_notes,
          exercises_library ( id, name, video_url, description ) ) )`)
    .eq('client_id', clientId)
    .eq('is_active', true)
    .maybeSingle()) as any;
  if (!block) return null;
  return {
    id: block.id,
    name: block.name,
    days: (block.training_days ?? [])
      .map((d: any) => ({
        id: d.id,
        day_number: d.day_number,
        name: d.name,
        exercises: (d.training_exercises ?? []).map((te: any) => ({
          id: te.id, sets: te.sets, reps: te.reps != null ? String(te.reps) : null, rir: te.rir,
          rest_seconds: te.rest_seconds, tempo: te.tempo, trainer_notes: te.trainer_notes,
          exercise: one(te.exercises_library),
        })),
      }))
      .sort((a: TrainingDay, b: TrainingDay) => a.day_number - b.day_number),
  };
}

export async function fetchMyLogs(clientId: string): Promise<ExerciseLog[]> {
  return check(await supabase
    .from('exercise_logs')
    .select('training_exercise_id, logged_at, weight, reps')
    .eq('client_id', clientId)
    .order('logged_at', { ascending: false })
    .limit(300)) ?? [];
}

export async function logSet(input: { clientId: string; trainingExerciseId: string; weight: number; reps: number; rir?: number | null; note?: string | null }) {
  check(await supabase.from('exercise_logs').insert({
    training_exercise_id: input.trainingExerciseId,
    client_id: input.clientId,
    weight: input.weight,
    reps: input.reps,
    rir: input.rir ?? null,
    client_note: input.note?.trim() || null,
  }));
}

// ---------- Cliente: nutrición ----------
export async function fetchActivePlan(clientId: string): Promise<NutritionPlan | null> {
  const plan = check(await supabase
    .from('nutrition_plans')
    .select(`id, name, target_kcal, target_protein, target_carbs, target_fat,
      meals ( id, name, order_index,
        meal_options ( id, option_number, is_selected,
          meal_option_foods ( id, quantity_grams,
            foods_library ( name, kcal_per_100, protein_per_100, carbs_per_100, fat_per_100 ) ) ) )`)
    .eq('client_id', clientId)
    .eq('is_active', true)
    .maybeSingle()) as any;
  if (!plan) return null;
  return {
    ...plan,
    meals: (plan.meals ?? [])
      .map((m: any) => ({
        id: m.id, name: m.name, order_index: m.order_index,
        options: (m.meal_options ?? [])
          .map((o: any) => ({
            id: o.id, option_number: o.option_number, is_selected: o.is_selected,
            foods: (o.meal_option_foods ?? []).map((f: any) => ({ id: f.id, quantity_grams: f.quantity_grams, food: one(f.foods_library) })),
          }))
          .sort((a: MealOption, b: MealOption) => a.option_number - b.option_number),
      }))
      .sort((a: Meal, b: Meal) => a.order_index - b.order_index),
  };
}

export function optionTotals(option: MealOption) {
  return option.foods.reduce((acc, f) => {
    if (!f.food) return acc;
    const k = f.quantity_grams / 100;
    acc.kcal += f.food.kcal_per_100 * k;
    acc.protein += f.food.protein_per_100 * k;
    acc.carbs += f.food.carbs_per_100 * k;
    acc.fat += f.food.fat_per_100 * k;
    return acc;
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

export async function chooseOption(optionId: string, mealId: string) {
  check(await supabase.from('meal_options').update({ is_selected: false }).eq('meal_id', mealId));
  check(await supabase.from('meal_options').update({ is_selected: true }).eq('id', optionId));
}

// ---------- Cliente: progreso ----------
export async function fetchProgress(clientId: string): Promise<{ goal: WeightGoal | null; logs: WeightLog[] }> {
  const [goalRes, logsRes] = await Promise.all([
    supabase.from('weight_goals').select('start_weight, target_weight, start_date, target_date').eq('client_id', clientId).eq('is_active', true).maybeSingle(),
    supabase.from('weight_logs').select('logged_at, weight').eq('client_id', clientId).order('logged_at', { ascending: false }).limit(12),
  ]);
  return { goal: check(goalRes), logs: (check(logsRes) ?? []).slice().reverse() };
}

export async function logWeight(clientId: string, weight: number) {
  check(await supabase.from('weight_logs').insert({ client_id: clientId, weight }));
}

/** Sube la foto al bucket privado (carpeta = id del cliente, como exige la política de storage) y la registra */
export async function uploadProgressPhoto(clientId: string, uri: string, mimeType: string | undefined, photoType: string) {
  const ext = mimeType === 'image/png' ? 'png' : 'jpg';
  const path = `${clientId}/${Date.now()}.${ext}`;
  const body = await fetch(uri).then(r => r.arrayBuffer());
  const { error } = await supabase.storage.from('progress-photos').upload(path, body, { contentType: mimeType ?? 'image/jpeg' });
  if (error) throw new Error(error.message);
  check(await supabase.from('progress_photos').insert({ client_id: clientId, storage_path: path, photo_type: photoType }));
}

// ---------- Cliente: check-ins ----------
export async function fetchMyCheckins(clientId: string): Promise<CheckinSchedule[]> {
  const rows = check(await supabase
    .from('checkin_schedule')
    .select('id, day_of_week, checkin_templates ( id, name, questions )')
    .eq('client_id', clientId)
    .eq('is_active', true)) as any[] | null;
  return (rows ?? []).map(r => {
    const t = one<any>(r.checkin_templates);
    return { id: r.id, day_of_week: r.day_of_week, template: t ? { id: t.id, name: t.name, questions: t.questions ?? [] } : null };
  });
}

export async function submitCheckin(clientId: string, templateId: string, answers: Record<string, string>) {
  // Las respuestas se guardan por texto de la pregunta, igual que en la web
  check(await supabase.from('checkin_responses').insert({ client_id: clientId, template_id: templateId, answers }));
}

// ---------- Coach ----------
export async function fetchClients(): Promise<ClientSummary[]> {
  return check(await supabase.from('clients').select('id, full_name, email, status, goal').order('full_name')) ?? [];
}

export async function fetchRecentResponses(clientId?: string): Promise<CheckinResponse[]> {
  let q = supabase
    .from('checkin_responses')
    .select('id, submitted_at, answers, clients(full_name), checkin_templates(name)')
    .order('submitted_at', { ascending: false })
    .limit(20);
  if (clientId) q = q.eq('client_id', clientId);
  const rows = check(await q) as any[] | null;
  return (rows ?? []).map(r => ({
    id: r.id,
    submitted_at: r.submitted_at,
    answers: r.answers ?? {},
    clientName: one<any>(r.clients)?.full_name ?? '',
    templateName: one<any>(r.checkin_templates)?.name ?? '',
  }));
}

export async function fetchExercises(): Promise<Exercise[]> {
  return check(await supabase.from('exercises_library').select('id, name, video_url, description').order('name')) ?? [];
}
