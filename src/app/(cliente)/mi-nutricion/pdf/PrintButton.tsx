'use client';

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
      Guardar como PDF
    </button>
  );
}
