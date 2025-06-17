const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiRequestOptions extends RequestInit {
  token?: string;
  anonymousToken?: string;
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
  }

  if (anonymousToken) {
    requestHeaders['x-anonymous-token'] = anonymousToken;
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