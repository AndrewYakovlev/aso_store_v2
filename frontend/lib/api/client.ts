const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiRequestOptions extends RequestInit {
  token?: string;
  anonymousToken?: string;
}

// Helper function to get anonymous token from localStorage or cookies
export function getAnonymousToken(): string | null {
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

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { token, anonymousToken, headers = {}, ...fetchOptions } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
    console.log('API Request - Adding Authorization header');
  }

  if (anonymousToken) {
    requestHeaders['x-anonymous-token'] = anonymousToken;
    console.log('API Request - Adding anonymous token header');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data?.message || 'Request failed',
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error', error);
  }
}