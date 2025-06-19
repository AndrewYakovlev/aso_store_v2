'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useAnonymousToken } from './useAnonymousToken';

export interface ApiAuthResult {
  token?: string;
  anonymousToken?: string;
  isAuthenticated: boolean;
}

/**
 * Hook that returns the appropriate authentication tokens for API requests.
 * JWT token always takes priority over anonymous token.
 */
export function useApiAuth(): ApiAuthResult {
  const { accessToken, user } = useAuth();
  const { token: anonymousToken } = useAnonymousToken();

  // If user is authenticated, return JWT token
  if (accessToken && user) {
    return {
      token: accessToken,
      isAuthenticated: true,
    };
  }

  // Otherwise, return anonymous token
  return {
    anonymousToken: anonymousToken || undefined,
    isAuthenticated: false,
  };
}