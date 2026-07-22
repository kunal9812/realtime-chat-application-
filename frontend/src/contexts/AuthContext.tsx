'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/lib/types';
import { authApi } from '@/lib/api';
import { initSocket, disconnectSocket } from '@/lib/socket';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await authApi.me();
          setUser(res.data); // backend returns user object directly
          initSocket(token);
        }
      } catch (err) {
        localStorage.removeItem('token');
        disconnectSocket();
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('token', res.data.accessToken);
    setUser(res.data.user);
    initSocket(res.data.accessToken);
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await authApi.register(username, email, password);
    localStorage.setItem('token', res.data.accessToken);
    setUser(res.data.user);
    initSocket(res.data.accessToken);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch (e) {}
    localStorage.removeItem('token');
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
