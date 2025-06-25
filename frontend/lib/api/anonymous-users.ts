import { apiRequest } from './client';

export interface AnonymousUser {
  id: string;
  token: string;
  lastActivity: string;
  createdAt: string;
  _count?: {
    carts: number;
    favorites: number;
    chats: number;
  };
}

export interface AnonymousUserFilter {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
  hasActivity?: boolean;
}

export interface PaginatedAnonymousUsersResponse {
  data: AnonymousUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const anonymousUsersApi = {
  getAll: async (accessToken: string, filter?: AnonymousUserFilter): Promise<PaginatedAnonymousUsersResponse> => {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    return apiRequest<PaginatedAnonymousUsersResponse>(`/anonymous-users?${params.toString()}`, {
      token: accessToken,
    });
  },

  getById: async (accessToken: string, id: string): Promise<AnonymousUser> => {
    return apiRequest<AnonymousUser>(`/anonymous-users/${id}`, {
      token: accessToken,
    });
  },

  delete: async (accessToken: string, id: string): Promise<void> => {
    return apiRequest<void>(`/anonymous-users/${id}`, {
      method: 'DELETE',
      token: accessToken,
    });
  },
};