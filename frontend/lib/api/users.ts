'use client';

import { apiRequestWithAuth } from './client-with-auth';

// Types
export enum Role {
  CUSTOMER = 'CUSTOMER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  companyName?: string;
  companyInn?: string;
  defaultShippingAddress?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
    chats: number;
    favorites?: number;
  };
  orders?: any[];
  isNewUser?: boolean;
  orderStats?: {
    count: number;
    totalAmount: number;
    lastOrderDate: string | null;
  };
}

export type UserDto = User;

export interface CreateUserDto {
  phone: string;
  firstName: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  companyName?: string;
  companyInn?: string;
  role: Role;
}

export interface UpdateUserDto {
  phone?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  companyName?: string;
  companyInn?: string;
  role?: Role;
}

export interface UserFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersStatistics {
  total: number;
  byRole: {
    CUSTOMER?: number;
    MANAGER?: number;
    ADMIN?: number;
  };
  recentRegistrations: number;
}

export interface PaginatedUsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Users API
export const usersApi = {
  async getAll(accessToken: string, filter: UserFilter = {}): Promise<PaginatedUsersResponse> {
    const params = new URLSearchParams();
    
    if (filter.page) params.append('page', filter.page.toString());
    if (filter.limit) params.append('limit', filter.limit.toString());
    if (filter.search) params.append('search', filter.search);
    if (filter.role) params.append('role', filter.role);
    if (filter.createdFrom) params.append('createdFrom', filter.createdFrom);
    if (filter.createdTo) params.append('createdTo', filter.createdTo);
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);

    const queryString = params.toString();
    return apiRequestWithAuth(`/users${queryString ? `?${queryString}` : ''}`, {
      token: accessToken,
    });
  },

  async getById(accessToken: string, id: string): Promise<User> {
    return apiRequestWithAuth(`/users/${id}`, {
      token: accessToken,
    });
  },

  async create(accessToken: string, data: CreateUserDto): Promise<User> {
    return apiRequestWithAuth('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      token: accessToken,
    });
  },

  async update(accessToken: string, id: string, data: UpdateUserDto): Promise<User> {
    return apiRequestWithAuth(`/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      token: accessToken,
    });
  },

  async delete(accessToken: string, id: string): Promise<{ message: string }> {
    return apiRequestWithAuth(`/users/${id}`, {
      method: 'DELETE',
      token: accessToken,
    });
  },

  async getStatistics(accessToken: string): Promise<UsersStatistics> {
    return apiRequestWithAuth('/users/statistics', {
      token: accessToken,
    });
  },

  async findOrCreateByPhone(phone: string, name: string | undefined, accessToken: string): Promise<UserDto> {
    return apiRequestWithAuth('/users/find-or-create-by-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, name }),
      token: accessToken,
    });
  },

  async getUserCart(accessToken: string, id: string): Promise<any> {
    return apiRequestWithAuth(`/users/${id}/cart`, {
      token: accessToken,
    });
  },

  async getUserFavorites(accessToken: string, id: string): Promise<any> {
    return apiRequestWithAuth(`/users/${id}/favorites`, {
      token: accessToken,
    });
  },

  async getUserChats(accessToken: string, id: string): Promise<any> {
    return apiRequestWithAuth(`/users/${id}/chats`, {
      token: accessToken,
    });
  },

  async getUserAnonymousUsers(accessToken: string, id: string): Promise<any[]> {
    return apiRequestWithAuth(`/users/${id}/anonymous-users`, {
      token: accessToken,
    });
  },
};