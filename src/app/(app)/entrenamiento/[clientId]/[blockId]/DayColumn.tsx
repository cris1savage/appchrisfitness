'use client';

import { useState, useTransition } from 'react';
import { addExerciseToDay, removeTrainingExercise } from '../actions';

type Exercise = { id: string; name: string; video_url: string | null };
type TrainingExercise = {
  id: string;
  sets: number | null;
  reps: string | null;
  rir: number | null;
  rest_seconds: number | null;
  trainer_notes: string | null;
  exercises_library: Exercise | Exercise[] | null;
};
type Log = {
  training_exercise_id: string;
  logged_at: string;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  client_note: string | null;
  trainer_note: string | null;
};

export function DayColumn({
  day,
  clientId,
  exerciseLibrary,
  logs,
}: {
  day: { id: string; day_number: number; name: string | null; training_exercises: TrainingExercise[] };
  clientId: string;
  exerciseLibrary: { id: string; name: string }[];
  logs: Log[];
}) {
  const [addingExercise, setAddingExercise] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addExerciseToDay(day.id, clientId, formData);
      setAddingExercise(false);
    });
  }

  return (
    <div className="w-72 shrink-0 rounded-xl2 border border-line bg-panel p-4">
      <p className="mb-3 font-display text-sm tracking-wide text-cyan">
        Día {day.day_number}
        {day.name ? ` · ${day.name}` : ''}
      </p>

      <div className="flex flex-col gap-2">
        {day.training_exercises?.map((te) => {
          const exercise = Array.isArray(te.exercises_library) ? te.exercises_library[0] : te.exercises_library;
          const historyForThis = logs.filter((l) => l.training_exercise_id === te.id);

          return (
            <div key={te.id} className="rounded-lg border border-line bg-panel2 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-white">{exercise?.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {te.sets ?? '—'}×{te.reps ?? '—'} {te.rir != null ? `· RIR ${te.rir}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => startTransition(async () => { await removeTrainingExercise(te.id, clientId); })}
                  className="shrink-0 text-xs text-muted hover:text-risk-high"
                >
                  ✕
                </button>
              </div>

              <button
                onClick={() => setExpandedHistory(expandedHistory === te.id ? null : te.id)}
                className="mt-2 text-xs text-cyan hover:underline"
              >
                {expandedHistory === te.id ? 'Ocultar historial' : `Ver historial (${historyForThis.length})`}
              </button>

              {expandedHistory === te.id && (
                <div className="mt-2 flex flex-col gap-1.5 border-t border-line pt-2">
                  {historyForThis.length === 0 && (
                    <p className="text-xs text-muted">Sin registros todavía.</p>
                  )}
                  {historyForThis.map((log, i) => (
                    <div key={i} className="text-xs text-muted">
                      <span className="text-white">
                        {new Date(log.logged_at).toLocaleDateString('es-ES')}:
                      </span>{' '}
                      {log.weight ?? '—'}kg × {log.reps ?? '—'} {log.rir != null ? `RIR ${log.rir}` : ''}
                      {log.client_note && <p className="italic">Cliente: {log.client_note}</p>}
                      {log.trainer_note && <p className="italic">Tú: {log.trainer_note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {addingExercise ? (
        <form action={handleAdd} className="mt-3 flex flex-col gap-2 rounded-lg border border-line bg-panel2 p-3">
          <select name="exercise_id" required className="rounded-md border border-line bg-ink px-2 py-1.5 text-sm text-white outline-none focus:border-cyan">
            <option value="">Elige ejercicio…</option>
            {exerciseLibrary.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-1.5">
            <input name="sets" type="number" placeholder="Series" className="rounded-md border border-line bg-ink px-2 py-1.5 text-sm text-white outline-none focus:border-cyan" />
            <input name="reps" placeholder="Reps" className="rounded-md border border-line bg-ink px-2 py-1.5 text-sm text-white outline-none focus:border-cyan" />
            <input name="rir" type="number" placeholder="RIR" className="rounded-md border border-line bg-ink px-2 py-1.5 text-sm text-white outline-none focus:border-cyan" />
          </div>
          <textarea name="trainer_notes" placeholder="Notas" rows={2} className="rounded-md border border-line bg-ink px-2 py-1.5 text-sm text-white outline-none focus:border-cyan" />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="rounded-md bg-cyan px-2.5 py-1.5 text-xs font-semibold text-ink hover:opacity-90">
              Añadir
            </button>
            <button type="button" onClick={() => setAddingExercise(false)} className="text-xs text-muted hover:text-white">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAddingExercise(true)} className="mt-3 w-full rounded-lg border border-dashed border-line py-2 text-xs text-muted hover:border-cyan hover:text-cyan">
          + Ejercicio
        </button>
      )}
    </div>
  );
}
