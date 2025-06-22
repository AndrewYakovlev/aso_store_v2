import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatisticsDto {
  @ApiProperty({ description: 'Общая статистика' })
  overview: {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalProducts: number;
    activeChats: number;
    pendingOrders: number;
  };

  @ApiProperty({ description: 'Статистика по периодам' })
  periods: {
    today: {
      orders: number;
      revenue: number;
      users: number;
    };
    yesterday: {
      orders: number;
      revenue: number;
      users: number;
    };
    week: {
      orders: number;
      revenue: number;
      users: number;
    };
    month: {
      orders: number;
      revenue: number;
      users: number;
    };
  };

  @ApiProperty({ description: 'Топ товаров' })
  topProducts: Array<{
    id: string;
    name: string;
    sku: string;
    sold: number;
    revenue: number;
  }>;

  @ApiProperty({ description: 'Топ категорий' })
  topCategories: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
  }>;

  @ApiProperty({ description: 'Последние заказы' })
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: {
      id: string;
      name: string;
      color: string;
    };
    total: number;
    createdAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName?: string;
      phone: string;
    };
  }>;

  @ApiProperty({ description: 'График заказов за последние 7 дней' })
  ordersChart: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;

  @ApiProperty({ description: 'Распределение заказов по статусам' })
  ordersByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export class PeriodStatisticsDto {
  @ApiProperty({ required: false, description: 'Дата начала периода' })
  startDate?: string;

  @ApiProperty({ required: false, description: 'Дата окончания периода' })
  endDate?: string;
}
