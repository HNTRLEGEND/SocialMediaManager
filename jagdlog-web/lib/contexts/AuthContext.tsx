'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  rolle: 'jaeger' | 'organisator' | 'admin';
  revierId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('jagdlog_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Create default user for MVP
      const defaultUser: User = {
        id: crypto.randomUUID(),
        name: 'Demo Jäger',
        email: 'demo@jagdlog.de',
        rolle: 'organisator',
      };
      setUser(defaultUser);
      localStorage.setItem('jagdlog_user', JSON.stringify(defaultUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // MVP: Simple login, später mit Backend ersetzen
    const user: User = {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email,
      rolle: 'jaeger',
    };
    setUser(user);
    localStorage.setItem('jagdlog_user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jagdlog_user');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('jagdlog_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
