'use client';

import { authApi } from '../api/auth';

const ANONYMOUS_TOKEN_KEY = 'anonymous_token';
const ANONYMOUS_USER_ID_KEY = 'anonymous_user_id';

export class ClientAnonymousTokenService {
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ANONYMOUS_TOKEN_KEY);
  }

  static getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ANONYMOUS_USER_ID_KEY);
  }

  static setToken(token: string, userId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ANONYMOUS_TOKEN_KEY, token);
    localStorage.setItem(ANONYMOUS_USER_ID_KEY, userId);
  }

  static clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ANONYMOUS_TOKEN_KEY);
    localStorage.removeItem(ANONYMOUS_USER_ID_KEY);
  }

  static async ensureToken(): Promise<string> {
    // Always use the Route Handler to ensure synchronization
    const response = await fetch('/api/auth/anonymous', {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to ensure anonymous token');
    }

    const data = await response.json();
    
    // Sync with localStorage
    if (data.token && data.userId) {
      this.setToken(data.token, data.userId);
    }
    
    return data.token;
  }
}