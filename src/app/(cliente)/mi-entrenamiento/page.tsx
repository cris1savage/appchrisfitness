import { createClient } from '@/lib/supabase/server';
import { getMyClientId } from '@/lib/getMyClientId';
import { LogExerciseForm } from './LogExerciseForm';

export default async function MiEntrenamientoPage() {
  const clientId = await getMyClientId();
  const supabase = createClient();

  if (!clientId) {
    return <p className="text-center text-muted">No se ha podido identificar tu cuenta de cliente.</p>;
  }

  const { data: block } = await supabase
    .from('training_blocks')
    .select(
      `id, name, length_days,
       training_days (
         id, day_number, name,
         training_exercises (
           id, sets, reps, rir, rest_seconds, tempo, trainer_notes,
           exercises_library ( id, name, video_url, description )
         )
       )`
    )
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('day_number', { referencedTable: 'training_days' })
    .maybeSingle();

  const { data: myLogs } = await supabase
    .from('exercise_logs')
    .select('training_exercise_id, logged_at, weight, reps, client_note')
    .eq('client_id', clientId)
    .order('logged_at', { ascending: false });

  if (!block) {
    return <p className="text-center text-muted">Todavía no tienes un bloque de entrenamiento activo.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl tracking-wide text-white">{block.name}</h1>

      {(block.training_days ?? [])
        .sort((a: any, b: any) => a.day_number - b.day_number)
        .map((day: any) => (
          <div key={day.id} className="rounded-xl2 border border-line bg-panel p-4">
            <p className="mb-3 font-display text-sm tracking-wide text-cyan">
              Día {day.day_number}
              {day.name ? ` · ${day.name}` : ''}
            </p>
            <div className="flex flex-col gap-3">
              {(day.training_exercises ?? []).map((te: any) => {
                const exercise = Array.isArray(te.exercises_library) ? te.exercises_library[0] : te.exercises_library;
                const lastLog = myLogs?.find((l) => l.training_exercise_id === te.id);
                return (
                  <div key={te.id} className="rounded-lg border border-line bg-panel2 p-3">
                    <p className="text-sm text-white">{exercise?.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {te.sets ?? '—'}×{te.reps ?? '—'} {te.rir != null ? `· RIR ${te.rir}` : ''}
                    </p>
                    {exercise?.video_url && (
                      <a href={exercise.video_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-cyan hover:underline">
                        Ver vídeo de técnica →
                      </a>
                    )}
                    {te.trainer_notes && <p className="mt-1 text-xs italic text-muted">{te.trainer_notes}</p>}
                    {lastLog && (
                      <p className="mt-1 text-xs text-muted">
                        Última vez: {lastLog.weight}kg × {lastLog.reps}
                      </p>
                    )}
                    <LogExerciseForm trainingExerciseId={te.id} clientId={clientId} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
