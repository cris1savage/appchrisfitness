'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { registerPhoto } from './actions';

export function UploadPhotoForm({ clientId }: { clientId: string }) {
  const supabase = createClient();
  const [photoType, setPhotoType] = useState('frontal');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const path = `${clientId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from('progress-photos').upload(path, file);

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const result = await registerPhoto(clientId, path, photoType);
    setUploading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <select value={photoType} onChange={(e) => setPhotoType(e.target.value)} className="rounded-lg border border-line bg-panel2 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan">
        <option value="frontal">Frontal</option>
        <option value="lateral">Lateral</option>
        <option value="espalda">Espalda</option>
      </select>
      <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-cyan file:px-3 file:py-2 file:text-xs file:font-semibold file:text-ink" />
      {uploading && <p className="text-xs text-muted">Subiendo…</p>}
      {done && <p className="text-xs text-risk-ok">Foto guardada ✓</p>}
      {error && <p className="text-xs text-risk-high">{error}</p>}
    </div>
  );
}
