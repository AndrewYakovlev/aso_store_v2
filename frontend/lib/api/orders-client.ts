'use client';

import { UnifiedApiClient } from './unified-client';
import { CreateOrderData, Order, PaginatedOrders, OrdersFilter } from './orders';

export const ordersClientApi = {
  // Create new order - requires authentication
  async create(data: CreateOrderData): Promise<Order> {
    // UnifiedApiClient will automatically use JWT token if available
    return UnifiedApiClient.post<Order>('/orders', data);
  },

  // Get user orders
  async getOrders(filter?: OrdersFilter): Promise<PaginatedOrders> {
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

    return UnifiedApiClient.get<PaginatedOrders>(url);
  },

  // Get order by ID
  async getById(id: string): Promise<Order> {
    return UnifiedApiClient.get<Order>(`/orders/${id}`);
  },

  // Get order by order number
  async getByOrderNumber(orderNumber: string): Promise<Order> {
    return UnifiedApiClient.get<Order>(`/orders/by-number/${orderNumber}`);
  },
};