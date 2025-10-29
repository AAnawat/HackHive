import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { decodeJwt } from '../utils/jwt';
import type { User } from '../types';
import { login as apiLogin, getUser } from '../api/client';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  login: (gmail: string, password: string) => Promise<void>;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => decodeJwt<User>(localStorage.getItem('token')));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setUser(decodeJwt<User>(token));
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  async function login(gmail: string, password: string) {
    const res = await apiLogin(gmail, password);
    setToken(res.token);
  }

  function logout() {
    setToken(null);
  }

  async function reloadUser() {
    if (!user?.id) {
      throw new Error('No user to reload');
    }
    
    try {
      const updatedUser = await getUser(user.id);
      setUser(updatedUser as User);
    } catch (error) {
      console.error('Failed to reload user:', error);
      throw error;
    }
  }

  const value = useMemo<AuthContextValue>(() => ({ token, user, login, logout, reloadUser }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


