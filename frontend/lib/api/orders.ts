import { apiRequest, getAnonymousToken } from './client';
import { Product } from './products';

export interface OrderStatus {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface DeliveryMethod {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  offerId?: string;
  product?: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  anonymousUserId?: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  deliveryAmount: number;
  grandTotal: number;
  deliveryComment?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryStreet?: string;
  deliveryBuilding?: string;
  deliveryApartment?: string;
  deliveryPostalCode?: string;
  comment?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  deliveryMethodId: string;
  paymentMethodId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryStreet?: string;
  deliveryBuilding?: string;
  deliveryApartment?: string;
  deliveryPostalCode?: string;
  comment?: string;
}

export interface OrdersFilter {
  statusId?: string;
  orderNumber?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'orderNumber' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ordersApi = {
  // Get order statuses
  async getStatuses(): Promise<OrderStatus[]> {
    return apiRequest<OrderStatus[]>('/orders/statuses');
  },

  // Get delivery methods
  async getDeliveryMethods(): Promise<DeliveryMethod[]> {
    return apiRequest<DeliveryMethod[]>('/orders/delivery-methods');
  },

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiRequest<PaymentMethod[]>('/orders/payment-methods');
  },

  // Create new order
  async create(data: CreateOrderData): Promise<Order> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Get user orders
  async getOrders(filter?: OrdersFilter): Promise<PaginatedOrders> {
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

    return apiRequest<PaginatedOrders>(url, {
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Get order by ID
  async getById(id: string): Promise<Order> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<Order>(`/orders/${id}`, {
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Get order by order number
  async getByOrderNumber(orderNumber: string): Promise<Order> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<Order>(`/orders/by-number/${orderNumber}`, {
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Update order status (admin only)
  async updateStatus(id: string, statusId: string, accessToken: string): Promise<Order> {
    return apiRequest<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ statusId }),
    });
  },

  // Get all orders (admin only)
  async getAllOrders(filter?: OrdersFilter, accessToken?: string): Promise<PaginatedOrders> {
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
    const url = `/orders/admin${queryString ? `?${queryString}` : ''}`;

    return apiRequest<PaginatedOrders>(url, {
      headers: accessToken ? {
        'Authorization': `Bearer ${accessToken}`,
      } : undefined,
    });
  },
};