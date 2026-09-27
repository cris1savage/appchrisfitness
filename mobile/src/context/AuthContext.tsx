import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USUARIOS } from '../data/mockData';

export type User = { id: string; nombre: string; email: string; rol: 'coach' | 'cliente' };

type AuthCtx = {
  user: User | null;
  /** true solo mientras se restaura la sesión guardada al abrir la app */
  restoring: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isCoach: boolean;
};

const STORAGE_KEY = 'cf.session.v1';
const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(true);

  // Restaurar sesión guardada (si falla, simplemente se pide login de nuevo)
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!cancelled && raw) setUser(JSON.parse(raw) as User);
      })
      .catch(() => AsyncStorage.removeItem(STORAGE_KEY).catch(() => {}))
      .finally(() => { if (!cancelled) setRestoring(false); });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // TODO: sustituir por supabase.auth.signInWithPassword cuando se conecte el backend
    await new Promise(r => setTimeout(r, 400));
    const u = USUARIOS.find(x => x.email === email.toLowerCase().trim() && x.password === password);
    if (!u) throw new Error('Email o contraseña incorrectos');
    const next: User = { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol };
    setUser(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ user, restoring, login, logout, isCoach: user?.rol === 'coach' }),
    [user, restoring, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
