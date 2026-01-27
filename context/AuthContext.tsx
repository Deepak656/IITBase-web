'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { isAuthenticated, isAdmin } from '../lib/auth';

type AuthContextType = {
  authed: boolean;
  admin: boolean;
  refreshAuth: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin] = useState(false);

  const refreshAuth = () => {
    setAuthed(isAuthenticated());
    setAdmin(isAdmin());
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authed, admin, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
