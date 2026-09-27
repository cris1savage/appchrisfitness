import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../lib/api';

export type User = api.SessionUser;

type AuthCtx = {
  user: User | null;
  /** true solo mientras se restaura la sesión guardada al abrir la app */
  restoring: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isCoach: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(true);

  // Restaurar sesión (Supabase la guarda en el móvil). Sin conexión: se pide login de nuevo.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (await api.getSessionUserId()) {
          const u = await api.loadSessionUser();
          if (!cancelled) setUser(u);
        }
      } catch {
        // sesión caducada o sin red
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();
    const unsubscribe = api.onSignedOut(() => setUser(null));
    return () => { cancelled = true; unsubscribe(); };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await api.signIn(email, password);
    const u = await api.loadSessionUser();
    if (!u) throw new Error('No se pudo cargar tu perfil');
    if (u.role === 'client' && !u.clientId) {
      await api.signOut();
      throw new Error('Tu cuenta no está vinculada a ningún cliente. Habla con Chris.');
    }
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await api.signOut().catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ user, restoring, login, logout, isCoach: user?.role === 'admin' }),
    [user, restoring, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

/** Para pantallas de cliente: el id de cliente siempre existe (login lo garantiza) */
export function useClientId() {
  const { user } = useAuth();
  return user?.clientId ?? '';
}
