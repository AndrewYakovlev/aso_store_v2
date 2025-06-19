'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, UserProfile } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string, user: any) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const storedAccessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!storedAccessToken || !refreshToken) {
      setLoading(false);
      return;
    }

    setAccessToken(storedAccessToken);

    try {
      // Try to get user profile
      const profile = await authApi.getProfile(storedAccessToken);
      setUser(profile);
    } catch (error) {
      // Token might be expired, try to refresh
      try {
        await refreshAuth();
      } catch {
        // Refresh failed, clear tokens
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await authApi.refreshTokens(refreshToken);
    
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    setAccessToken(response.accessToken);
    
    const profile = await authApi.getProfile(response.accessToken);
    setUser(profile);
  };

  const login = (newAccessToken: string, refreshToken: string, userData: any) => {
    localStorage.setItem('access_token', newAccessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setAccessToken(newAccessToken);
    
    // Convert user data to profile format
    const profile: UserProfile = {
      ...userData,
      isPhoneVerified: true,
      createdAt: userData.createdAt || new Date().toISOString(),
    };
    
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAccessToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, refreshAuth }}>
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