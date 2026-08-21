'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Photo = { id: string; taken_at: string; photo_type: string | null; storage_path: string };

export function PhotoCompare({ photos, clientId }: { photos: Photo[]; clientId: string }) {
  const supabase = createClient();
  const [beforeId, setBeforeId] = useState(photos[0]?.id ?? '');
  const [afterId, setAfterId] = useState(photos[photos.length - 1]?.id ?? '');
  const [sliderPos, setSliderPos] = useState(50);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const before = photos.find((p) => p.id === beforeId);
  const after = photos.find((p) => p.id === afterId);

  // las fotos son privadas: se firma un link temporal en vez de usar una URL pública fija
  useEffect(() => {
    async function signUrls() {
      const targets = [before, after].filter(Boolean) as Photo[];
      const next: Record<string, string> = {};
      for (const photo of targets) {
        if (urls[photo.id]) continue;
        const { data } = await supabase.storage
          .from('progress-photos')
          .createSignedUrl(photo.storage_path, 60 * 10); // 10 minutos
        if (data?.signedUrl) next[photo.id] = data.signedUrl;
      }
      if (Object.keys(next).length) setUrls((prev) => ({ ...prev, ...next }));
    }
    signUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beforeId, afterId]);

  function handleDrag(clientX: number) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pct)));
  }

  if (photos.length < 2) {
    return (
      <p className="rounded-xl2 border border-line bg-panel px-5 py-8 text-center text-muted">
        Necesitas al menos 2 fotos subidas para comparar. Las fotos se suben desde la app del cliente en cada check-in.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1.5 block text-xs text-muted">Antes</label>
          <select value={beforeId} onChange={(e) => setBeforeId(e.target.value)} className="rounded-lg border border-line bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-cyan">
            {photos.map((p) => (
              <option key={p.id} value={p.id}>
                {new Date(p.taken_at).toLocaleDateString('es-ES')} {p.photo_type ? `· ${p.photo_type}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Después</label>
          <select value={afterId} onChange={(e) => setAfterId(e.target.value)} className="rounded-lg border border-line bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-cyan">
            {photos.map((p) => (
              <option key={p.id} value={p.id}>
                {new Date(p.taken_at).toLocaleDateString('es-ES')} {p.photo_type ? `· ${p.photo_type}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {before && after && urls[before.id] && urls[after.id] && (
        <div
          ref={containerRef}
          className="relative aspect-[3/4] w-full max-w-md select-none overflow-hidden rounded-xl2 border border-line bg-panel2"
          onMouseMove={(e) => e.buttons === 1 && handleDrag(e.clientX)}
          onTouchMove={(e) => handleDrag(e.touches[0].clientX)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={urls[after.id]} alt="Después" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={urls[before.id]} alt="Antes" className="h-full w-full object-cover" style={{ width: `${(100 / sliderPos) * 100}%`, maxWidth: 'none' }} />
          </div>
          <div
            className="absolute top-0 h-full w-0.5 cursor-ew-resize bg-cyan"
            style={{ left: `${sliderPos}%` }}
            onMouseDown={(e) => {
              e.preventDefault();
              const move = (ev: MouseEvent) => handleDrag(ev.clientX);
              const up = () => {
                window.removeEventListener('mousemove', move);
                window.removeEventListener('mouseup', up);
              };
              window.addEventListener('mousemove', move);
              window.addEventListener('mouseup', up);
            }}
          >
            <div className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan bg-ink" />
          </div>
          <span className="absolute bottom-2 left-2 rounded bg-ink/70 px-2 py-1 text-xs text-white">Antes</span>
          <span className="absolute bottom-2 right-2 rounded bg-ink/70 px-2 py-1 text-xs text-white">Después</span>
        </div>
      )}
    </div>
  );
}
