import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
    phone?: string | null;
    date_of_birth?: string | null;
  }) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<User>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verify token is still valid
          await authAPI.getProfile();
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authAPI.login({ email, password });
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
    phone?: string | null;
    date_of_birth?: string | null;
  }) => {
    try {
      const response: AuthResponse = await authAPI.register(userData);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authAPI.updateProfile(userData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    updateUser,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
