import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Carga datos con estados de carga/error y recarga al volver a la pestaña,
 * para que lo que cambia el coach en la web aparezca sin reiniciar la app.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);
  const loaded = useRef(false);

  useEffect(() => () => { mounted.current = false; }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async (mode: 'initial' | 'refresh' | 'silent') => {
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    try {
      const result = await fn();
      if (!mounted.current) return;
      setData(result);
      setError(null);
      loaded.current = true;
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : 'Error de conexión');
    } finally {
      if (mounted.current) { setLoading(false); setRefreshing(false); }
    }
  }, deps);

  useFocusEffect(useCallback(() => { run(loaded.current ? 'silent' : 'initial'); }, [run]));

  return { data, setData, error, loading, refreshing, refresh: () => run('refresh'), reload: () => run('silent') };
}
