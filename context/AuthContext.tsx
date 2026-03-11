'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { isAuthenticated, removeToken } from '../lib/auth';
import { api } from '../lib/api';

type User = {
  email: string;
  role: string;
  college?: string;
  graduationYear?: number;
} | null;

type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const userData = await api.user.me();
        setUser({
          email: userData.email,
          role: userData.role,
          college: userData.college,
          graduationYear: userData.graduationYear,
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Listen for 401 errors
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      removeToken();
      window.location.href = '/login';
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const logout = async () => {
    try {
      await api.auth.logout();
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
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading,
        setUser,
        logout,

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
