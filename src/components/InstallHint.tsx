'use client';

import { useEffect, useState } from 'react';

const KEY = 'cf.installHint.dismissed';

/**
 * En iPhone Safari no hay botón automático de "Instalar": explicamos cómo añadirla
 * a la pantalla de inicio. En Android, Chrome ya muestra su propio aviso.
 */
export function InstallHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const ua = window.navigator.userAgent;
      const isIos = /iphone|ipad|ipod/i.test(ua);
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setShow(isIos && !standalone && localStorage.getItem(KEY) !== '1');
    } catch {
      setShow(false);
    }
  }, []);

  if (!show) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {}
    setShow(false);
  }

  return (
    <div className="flex items-start gap-3 border-b border-line bg-panel2 px-4 py-3 text-xs text-muted">
      <p className="flex-1">
        <span className="text-white">Instala la app:</span> pulsa <span className="text-white">Compartir</span> (el cuadrado
        con la flecha) y luego <span className="text-white">«Añadir a pantalla de inicio»</span>.
      </p>
      <button onClick={dismiss} aria-label="Cerrar" className="text-muted hover:text-white">
        ✕
      </button>
    </div>
  );
}
