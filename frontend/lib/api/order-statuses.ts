'use client';

import { apiRequest } from './client';
import { apiRequestWithAuth } from './client-with-auth';

// Types
export interface OrderStatus {
  id: string;
  code: string;
  name: string;
  color: string;
  description: string | null;
  isActive: boolean;
  isFinal: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
}

export interface CreateOrderStatusDto {
  code: string;
  name: string;
  color: string;
  description?: string;
  isActive?: boolean;
  isFinal?: boolean;
  sortOrder?: number;
}

export interface UpdateOrderStatusDto {
  name?: string;
  color?: string;
  description?: string;
  isActive?: boolean;
  isFinal?: boolean;
  sortOrder?: number;
}

// Order Statuses API
export const orderStatusesApi = {
  // Public methods
  async getAll(onlyActive: boolean = false): Promise<OrderStatus[]> {
    const params = onlyActive ? '?onlyActive=true' : '';
    return apiRequest(`/order-statuses${params}`);
  },

  async getById(id: string): Promise<OrderStatus> {
    return apiRequest(`/order-statuses/${id}`);
  },

  async getByCode(code: string): Promise<OrderStatus> {
    return apiRequest(`/order-statuses/code/${code}`);
  },

  // Auth required methods
  async getTransitions(accessToken: string, fromStatusId: string): Promise<OrderStatus[]> {
    return apiRequestWithAuth(`/order-statuses/${fromStatusId}/transitions`, {
      token: accessToken,
    });
  },

  // Admin methods
  async create(accessToken: string, data: CreateOrderStatusDto): Promise<OrderStatus> {
    return apiRequestWithAuth('/order-statuses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      token: accessToken,
    });
  },

  async update(accessToken: string, id: string, data: UpdateOrderStatusDto): Promise<OrderStatus> {
    return apiRequestWithAuth(`/order-statuses/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      token: accessToken,
    });
  },

  async delete(accessToken: string, id: string): Promise<{ message: string }> {
    return apiRequestWithAuth(`/order-statuses/${id}`, {
      method: 'DELETE',
      token: accessToken,
    });
  },

  async reorder(accessToken: string, items: { id: string; sortOrder: number }[]): Promise<{ message: string }> {
    return apiRequestWithAuth('/order-statuses/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items),
      token: accessToken,
    });
  },
};