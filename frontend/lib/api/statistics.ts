import { apiRequest } from './client';
import { apiRequestWithAuth } from './client-with-auth';

export interface OverallStatistics {
  totalOrders: number
  totalRevenue: string
  totalCustomers: number
  totalProducts: number
  activeOrders: number
  todayOrders: number
  todayRevenue: string
}

export interface PeriodicStatisticsItem {
  period: string
  orders: number
  revenue: string
}

export interface TopProduct {
  productId: string
  productName: string
  productSku: string
  brand: string
  category: string
  orderCount: number
  totalQuantity: number
  totalRevenue: string
}

export interface OrderStatusStatistics {
  statusId: string
  statusName: string
  statusColor: string
  orderCount: number
}

export interface PaymentMethodStatistics {
  methodId: string
  methodName: string
  orderCount: number
  totalRevenue: string
}

export interface NewCustomersStatistics {
  newCustomers: number
  customersWithOrders: number
  conversionRate: number
}

// Server-side functions
export async function getOverallStatistics(
  accessToken: string
): Promise<OverallStatistics> {
  return apiRequest('/statistics/overall', {
    token: accessToken,
  });
}

export async function getPeriodicStatistics(
  accessToken: string,
  period?: "day" | "week" | "month"
): Promise<PeriodicStatisticsItem[]> {
  const params = new URLSearchParams();
  if (period) {
    params.append("period", period);
  }
  const queryString = params.toString();
  const endpoint = `/statistics/periodic${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest(endpoint, {
    token: accessToken,
  });
}

export async function getTopProducts(
  accessToken: string,
  limit?: number
): Promise<TopProduct[]> {
  const params = new URLSearchParams();
  if (limit) {
    params.append("limit", limit.toString());
  }
  const queryString = params.toString();
  const endpoint = `/statistics/top-products${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest(endpoint, {
    token: accessToken,
  });
}

export async function getOrderStatusStatistics(
  accessToken: string
): Promise<OrderStatusStatistics[]> {
  return apiRequest('/statistics/order-status', {
    token: accessToken,
  });
}

export async function getPaymentMethodStatistics(
  accessToken: string
): Promise<PaymentMethodStatistics[]> {
  return apiRequest('/statistics/payment-methods', {
    token: accessToken,
  });
}

export async function getNewCustomersStatistics(
  accessToken: string,
  days?: number
): Promise<NewCustomersStatistics> {
  const params = new URLSearchParams();
  if (days) {
    params.append("days", days.toString());
  }
  const queryString = params.toString();
  const endpoint = `/statistics/new-customers${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest(endpoint, {
    token: accessToken,
  });
}

// Client-side API class
export class StatisticsApi {
  static async getOverallStatistics(
    accessToken: string
  ): Promise<OverallStatistics> {
    return apiRequestWithAuth('/statistics/overall', {
      token: accessToken,
    });
  }

  static async getPeriodicStatistics(
    accessToken: string,
    period?: "day" | "week" | "month"
  ): Promise<PeriodicStatisticsItem[]> {
    const params = new URLSearchParams();
    if (period) {
      params.append("period", period);
    }
    const queryString = params.toString();
    const endpoint = `/statistics/periodic${queryString ? `?${queryString}` : ''}`;
    
    return apiRequestWithAuth(endpoint, {
      token: accessToken,
    });
  }

  static async getTopProducts(
    accessToken: string,
    limit?: number
  ): Promise<TopProduct[]> {
    const params = new URLSearchParams();
    if (limit) {
      params.append("limit", limit.toString());
    }
    const queryString = params.toString();
    const endpoint = `/statistics/top-products${queryString ? `?${queryString}` : ''}`;
    
    return apiRequestWithAuth(endpoint, {
      token: accessToken,
    });
  }

  static async getOrderStatusStatistics(
    accessToken: string
  ): Promise<OrderStatusStatistics[]> {
    return apiRequestWithAuth('/statistics/order-status', {
      token: accessToken,
    });
  }

  static async getPaymentMethodStatistics(
    accessToken: string
  ): Promise<PaymentMethodStatistics[]> {
    return apiRequestWithAuth('/statistics/payment-methods', {
      token: accessToken,
    });
  }

  static async getNewCustomersStatistics(
    accessToken: string,
    days?: number
  ): Promise<NewCustomersStatistics> {
    const params = new URLSearchParams();
    if (days) {
      params.append("days", days.toString());
    }
    const queryString = params.toString();
    const endpoint = `/statistics/new-customers${queryString ? `?${queryString}` : ''}`;
    
    return apiRequestWithAuth(endpoint, {
      token: accessToken,
    });
  }
}
