'use client';

import { apiRequestWithAuth } from './client-with-auth';

// Types
export interface DashboardStatistics {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalProducts: number;
    activeChats: number;
    pendingOrders: number;
  };
  periods: {
    today: PeriodStats;
    yesterday: PeriodStats;
    week: PeriodStats;
    month: PeriodStats;
  };
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  recentOrders: RecentOrder[];
  ordersChart: ChartData[];
  ordersByStatus: StatusDistribution[];
}

interface PeriodStats {
  orders: number;
  revenue: number;
  users: number;
}

interface TopProduct {
  id: string;
  name: string;
  sku: string;
  sold: number;
  revenue: number;
}

interface TopCategory {
  id: string;
  name: string;
  orders: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: {
    id: string;
    name: string;
    color: string;
  };
  total: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName?: string;
    phone: string;
  };
}

interface ChartData {
  date: string;
  orders: number;
  revenue: number;
}

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface RevenueStatistics {
  total: number;
  average: number;
  count: number;
}

export interface ProductStatistics {
  total: number;
  active: number;
  outOfStock: number;
  lowStock: number;
}

export interface UserStatistics {
  total: number;
  byRole: {
    customers: number;
    managers: number;
    admins: number;
  };
  activeToday: number;
}

// Statistics API
export const statisticsApi = {
  async getDashboard(accessToken: string): Promise<DashboardStatistics> {
    return apiRequestWithAuth('/statistics/dashboard', {
      token: accessToken,
    });
  },

  async getRevenue(accessToken: string, startDate?: string, endDate?: string): Promise<RevenueStatistics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    return apiRequestWithAuth(`/statistics/revenue${queryString ? `?${queryString}` : ''}`, {
      token: accessToken,
    });
  },

  async getProducts(accessToken: string): Promise<ProductStatistics> {
    return apiRequestWithAuth('/statistics/products', {
      token: accessToken,
    });
  },

  async getUsers(accessToken: string): Promise<UserStatistics> {
    return apiRequestWithAuth('/statistics/users', {
      token: accessToken,
    });
  },
};