'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { isAuthenticated, removeToken } from '../lib/auth';
import { authApi } from '../lib/authApi';
import { userApi } from '../lib/userApi';

type User = {
  email: string;
  role: string;
} | null;

type AuthContextType = {
  user: User;
  role: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Refresh authenticated user
   * Used after login/signup or page refresh
   */
  const refreshAuth = async () => {
    if (!isAuthenticated()) {
      setUser(null);
      return;
    }

    try {
      const userData = await userApi.user.me();
      setUser({
        email: userData.email,
        role: userData.role,
      });
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      setUser(null);
      removeToken();
    }
  };

  /**
   * Initial auth check on app load
   */
  useEffect(() => {
    const initAuth = async () => {
      await refreshAuth();
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Global 401 / unauthorized handler
   */
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      removeToken();
      window.location.href = '/login';
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await authApi.auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      removeToken();
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null, 
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading,
        setUser,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
