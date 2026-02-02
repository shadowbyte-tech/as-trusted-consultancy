'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/definitions';

type Role = User['role'] | null;

interface AuthContextType {
  role: Role;
  login: (role: User['role']) => void;
  logout: () => void;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        try {
            const storedRole = sessionStorage.getItem('userRole') as Role;
            if (storedRole) {
                setRole(storedRole);
            }
        } catch (error) {
            console.error("Could not access session storage:", error);
        }
    }
    setIsAuthReady(true);
  }, []);

  const login = (newRole: User['role']) => {
    setRole(newRole);
     try {
      sessionStorage.setItem('userRole', newRole);
    } catch (error) {
      console.error("Could not access session storage:", error);
    }
  };

  const logout = () => {
    setRole(null);
     try {
      sessionStorage.removeItem('userRole');
    } catch (error) {
      console.error("Could not access session storage:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ role, login, logout, isAuthReady }}>
      {isAuthReady ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
