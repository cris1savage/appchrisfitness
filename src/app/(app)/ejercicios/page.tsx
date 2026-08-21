import { createClient } from '@/lib/supabase/server';
import { ExerciseForm } from './ExerciseForm';
import { DeleteExerciseButton } from './DeleteExerciseButton';

export default async function EjerciciosPage() {
  const supabase = createClient();

  const { data: exercises } = await supabase
    .from('exercises_library')
    .select('id, name, video_url, description')
    .order('name', { ascending: true });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-white">Biblioteca de ejercicios</h1>
        <p className="mt-1 text-sm text-muted">Tu base de datos de técnica, reutilizable en cualquier plan.</p>
      </div>

      <ExerciseForm />

      <div className="rounded-xl2 border border-line bg-panel">
        {exercises && exercises.length > 0 ? (
          <ul className="divide-y divide-line">
            {exercises.map((ex) => (
              <li key={ex.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-white">{ex.name}</p>
                  {ex.description && <p className="mt-0.5 text-sm text-muted">{ex.description}</p>}
                  {ex.video_url && (
                    <a
                      href={ex.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs text-cyan hover:underline"
                    >
                      Ver vídeo →
                    </a>
                  )}
                </div>
                <DeleteExerciseButton id={ex.id} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-muted">Todavía no tienes ejercicios en la biblioteca.</p>
        )}
      </div>
    </div>
  );
}
