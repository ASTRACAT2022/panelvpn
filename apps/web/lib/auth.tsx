import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth-token');
    if (savedToken) {
      api.auth.getProfile(savedToken)
        .then(userData => {
          if (userData) {
            setUser(userData);
            setToken(savedToken);
          }
        })
        .catch(() => {
          localStorage.removeItem('auth-token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login(email, password);
    if (response.user && response.token) {
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('auth-token', response.token);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await api.auth.register(email, password, name);
    if (response.user && response.token) {
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('auth-token', response.token);
    } else {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth-token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
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