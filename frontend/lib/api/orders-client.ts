'use client';

import { apiRequest, getAnonymousToken } from './client';
import { CreateOrderData, Order, PaginatedOrders, OrdersFilter } from './orders';

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export const ordersClientApi = {
  // Create new order - requires authentication
  async create(data: CreateOrderData): Promise<Order> {
    const authToken = getAuthToken();
    const anonymousToken = getAnonymousToken();
    
    console.log('Creating order with tokens:', {
      authToken: authToken ? 'present' : 'missing',
      anonymousToken: anonymousToken ? 'present' : 'missing',
    });
    
    // Orders require authentication, so only send auth token
    return apiRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
      token: authToken || undefined,
      // Don't send anonymous token for orders
    });
  },

  // Get user orders
  async getOrders(filter?: OrdersFilter): Promise<PaginatedOrders> {
    const authToken = getAuthToken();
    const anonymousToken = getAnonymousToken();
    
    const params = new URLSearchParams();
    
    if (filter) {
      if (filter.statusId) params.append('statusId', filter.statusId);
      if (filter.orderNumber) params.append('orderNumber', filter.orderNumber);
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.sortBy) params.append('sortBy', filter.sortBy);
      if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
    }

    const queryString = params.toString();
    const url = `/orders${queryString ? `?${queryString}` : ''}`;

    // If user is authenticated, don't send anonymous token
    return apiRequest<PaginatedOrders>(url, {
      token: authToken || undefined,
      anonymousToken: authToken ? undefined : (anonymousToken || undefined),
    });
  },

  // Get order by ID
  async getById(id: string): Promise<Order> {
    const authToken = getAuthToken();
    const anonymousToken = getAnonymousToken();
    
    // If user is authenticated, don't send anonymous token
    return apiRequest<Order>(`/orders/${id}`, {
      token: authToken || undefined,
      anonymousToken: authToken ? undefined : (anonymousToken || undefined),
    });
  },

  // Get order by order number
  async getByOrderNumber(orderNumber: string): Promise<Order> {
    const authToken = getAuthToken();
    const anonymousToken = getAnonymousToken();
    
    // If user is authenticated, don't send anonymous token
    return apiRequest<Order>(`/orders/by-number/${orderNumber}`, {
      token: authToken || undefined,
      anonymousToken: authToken ? undefined : (anonymousToken || undefined),
    });
  },
};