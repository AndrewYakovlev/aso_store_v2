'use client';

import { apiRequest } from './client';
import { apiRequestWithAuth } from './client-with-auth';

// Types
export interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
}

export interface CreateDeliveryMethodDto {
  name: string;
  description: string;
  price: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateDeliveryMethodDto {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  sortOrder?: number;
}

// Delivery Methods API
export const deliveryMethodsApi = {
  // Public methods
  async getAll(onlyActive: boolean = false): Promise<DeliveryMethod[]> {
    const params = onlyActive ? '?onlyActive=true' : '';
    return apiRequest(`/delivery-methods${params}`);
  },

  async getById(id: string): Promise<DeliveryMethod> {
    return apiRequest(`/delivery-methods/${id}`);
  },

  // Admin methods
  async create(accessToken: string, data: CreateDeliveryMethodDto): Promise<DeliveryMethod> {
    return apiRequestWithAuth('/delivery-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      token: accessToken,
    });
  },

  async update(accessToken: string, id: string, data: UpdateDeliveryMethodDto): Promise<DeliveryMethod> {
    return apiRequestWithAuth(`/delivery-methods/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      token: accessToken,
    });
  },

  async delete(accessToken: string, id: string): Promise<{ message: string }> {
    return apiRequestWithAuth(`/delivery-methods/${id}`, {
      method: 'DELETE',
      token: accessToken,
    });
  },

  async reorder(accessToken: string, items: { id: string; sortOrder: number }[]): Promise<{ message: string }> {
    return apiRequestWithAuth('/delivery-methods/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items),
      token: accessToken,
    });
  },
};