'use client';

import { apiRequest, ApiRequestOptions } from './client';

/**
 * Unified API client that automatically handles authentication.
 * Priority order:
 * 1. JWT token from localStorage (authenticated user)
 * 2. Anonymous token from localStorage
 */
export class UnifiedApiClient {
  private static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private static getAnonymousToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // First try localStorage
    const tokenFromStorage = localStorage.getItem('anonymous_token');
    if (tokenFromStorage) {
      return tokenFromStorage;
    }
    
    // Then try cookies
    const value = `; ${document.cookie}`;
    const parts = value.split(`; anonymous_token_client=`);
    
    if (parts.length === 2) {
      const token = parts.pop()?.split(';').shift() || null;
      return token;
    }
    
    return null;
  }

  static async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const authToken = this.getAuthToken();
    const anonymousToken = this.getAnonymousToken();

    // Priority: JWT token > Anonymous token
    if (authToken) {
      options.token = authToken;
      // Don't send anonymous token if user is authenticated
      options.anonymousToken = undefined;
    } else if (anonymousToken && !options.token) {
      options.anonymousToken = anonymousToken;
    }

    return apiRequest<T>(endpoint, options);
  }

  // Convenience methods
  static get<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static post<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  static put<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  static patch<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  static delete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}