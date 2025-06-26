'use client';

import { apiRequest } from './client';
import { apiRequestWithAuth } from './client-with-auth';

// Types
export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
}

export interface CreatePaymentMethodDto {
  code: string;
  name: string;
  description: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePaymentMethodDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Payment Methods API
export const paymentMethodsApi = {
  // Public methods
  async getAll(onlyActive: boolean = false): Promise<PaymentMethod[]> {
    const params = onlyActive ? '?onlyActive=true' : '';
    return apiRequest(`/payment-methods${params}`);
  },

  async getById(id: string): Promise<PaymentMethod> {
    return apiRequest(`/payment-methods/${id}`);
  },

  // Admin methods
  async create(accessToken: string, data: CreatePaymentMethodDto): Promise<PaymentMethod> {
    return apiRequestWithAuth('/payment-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      token: accessToken,
    });
  },

  async update(accessToken: string, id: string, data: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    return apiRequestWithAuth(`/payment-methods/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      token: accessToken,
    });
  },

  async delete(accessToken: string, id: string): Promise<{ message: string }> {
    return apiRequestWithAuth(`/payment-methods/${id}`, {
      method: 'DELETE',
      token: accessToken,
    });
  },

  async reorder(accessToken: string, items: { id: string; sortOrder: number }[]): Promise<{ message: string }> {
    return apiRequestWithAuth('/payment-methods/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items),
      token: accessToken,
    });
  },
};