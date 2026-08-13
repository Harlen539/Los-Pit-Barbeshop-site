import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setAccessToken } from '../lib/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
}
interface RegisterData { name: string; email: string; phone: string; password: string; birthDate?: string; acceptTerms: true }
interface SessionResponse { accessToken: string; user: User }

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<SessionResponse>('/auth/refresh', { method: 'POST' }, false)
      .then((session) => { setAccessToken(session.accessToken); setUser(session.user); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await api<SessionResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false);
    setAccessToken(session.accessToken); setUser(session.user); return session.user;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const session = await api<SessionResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }, false);
    setAccessToken(session.accessToken); setUser(session.user); return session.user;
  }, []);

  const updateUser = useCallback((updatedUser: User) => setUser(updatedUser), []);

  const logout = useCallback(async () => {
    await api<void>('/auth/logout', { method: 'POST' }).catch(() => undefined);
    setAccessToken(null); setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, updateUser, logout }), [user, loading, login, register, updateUser, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return value;
};
