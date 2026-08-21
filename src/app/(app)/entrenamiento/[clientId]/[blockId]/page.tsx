import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DayColumn } from './DayColumn';

export default async function BlockDetailPage({
  params,
}: {
  params: { clientId: string; blockId: string };
}) {
  const supabase = createClient();

  const [{ data: block }, { data: days }, { data: exerciseLibrary }] = await Promise.all([
    supabase.from('training_blocks').select('name, client_id').eq('id', params.blockId).single(),
    supabase
      .from('training_days')
      .select(
        `id, day_number, name,
         training_exercises (
           id, order_index, sets, reps, rir, rest_seconds, trainer_notes,
           exercises_library ( id, name, video_url )
         )`
      )
      .eq('block_id', params.blockId)
      .order('day_number'),
    supabase.from('exercises_library').select('id, name').order('name'),
  ]);

  // histórico: últimos logs por ejercicio para este cliente, para ver progresión
  const { data: logs } = await supabase
    .from('exercise_logs')
    .select('training_exercise_id, logged_at, weight, reps, rir, client_note, trainer_note')
    .eq('client_id', params.clientId)
    .order('logged_at', { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href={`/entrenamiento/${params.clientId}`} className="text-sm text-muted hover:text-cyan">
          ← Bloques
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-wide text-white">{block?.name}</h1>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {days?.map((day) => (
          <DayColumn
            key={day.id}
            day={day}
            clientId={params.clientId}
            exerciseLibrary={exerciseLibrary ?? []}
            logs={(logs ?? []).filter((l) =>
              day.training_exercises?.some((te: any) => te.id === l.training_exercise_id)
            )}
          />
        ))}
      </div>
    </div>
  );
}
