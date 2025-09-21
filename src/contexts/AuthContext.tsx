// Authentication Context for Tourist Safety Monitoring System
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, LoginCredentials, APIResponse } from '../types';
import { apiService } from '../services/api';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  hasPermission: (permission: keyof User['permissions']) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    // Check for existing authentication on mount
    checkAuthOnLoad();
  }, []);

  const checkAuthOnLoad = () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const userData = sessionStorage.getItem('user_data');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      // Clear corrupted data
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      const response: APIResponse<{ token: string; user: User }> = await apiService.login(credentials);
      
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        // Store authentication data
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        
        showNotification('Login successful', 'success');
        return true;
      } else {
        showNotification(response.error || 'Login failed', 'danger');
        return false;
      }
    } catch (error: any) {
      showNotification(error.message || 'Network error occurred', 'danger');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user state and redirect
      setUser(null);
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
      showNotification('Logged out successfully', 'info');
    }
  };

  const isAuthenticated = (): boolean => {
    const token = sessionStorage.getItem('auth_token');
    const userData = sessionStorage.getItem('user_data');
    return !!(token && userData && user);
  };

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    return user?.permissions[permission] || false;
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};