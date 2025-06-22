import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DashboardStatisticsDto,
  PeriodStatisticsDto,
} from './dto/statistics.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStatistics(): Promise<DashboardStatisticsDto> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Общая статистика
    const [totalOrders, totalUsers, totalProducts, activeChats, pendingOrders] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.chat.count({ where: { isActive: true } }),
        this.prisma.order.count({
          where: {
            status: {
              code: { in: ['NEW', 'PROCESSING'] },
            },
          },
        }),
      ]);

    const totalRevenue = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
    });

    // Статистика по периодам
    const [todayStats, yesterdayStats, weekStats, monthStats] =
      await Promise.all([
        this.getStatisticsForPeriod(today, new Date()),
        this.getStatisticsForPeriod(yesterday, today),
        this.getStatisticsForPeriod(weekAgo, new Date()),
        this.getStatisticsForPeriod(monthAgo, new Date()),
      ]);

    // Топ товаров
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const topProductsWithDetails = await Promise.all(
      topProducts
        .filter((item) => item.productId)
        .map(async (item) => {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId! },
          });
          return {
            id: product!.id,
            name: product!.name,
            sku: product!.sku,
            sold: item._sum.quantity || 0,
            revenue: Number(item._sum.price || 0),
          };
        }),
    );

    // Топ категорий
    const ordersByCategory = await this.prisma.$queryRaw<
      Array<{
        categoryId: string;
        orderCount: bigint;
        revenue: number;
      }>
    >`
      SELECT 
        pc."categoryId",
        COUNT(DISTINCT o.id) as "orderCount",
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM "OrderItem" oi
      INNER JOIN "Product" p ON p.id = oi."productId"
      INNER JOIN "ProductCategory" pc ON pc."productId" = p.id
      INNER JOIN "Order" o ON o.id = oi."orderId"
      GROUP BY pc."categoryId"
      ORDER BY "orderCount" DESC
      LIMIT 5
    `;

    const topCategories = await Promise.all(
      ordersByCategory.map(async (item) => {
        const category = await this.prisma.category.findUnique({
          where: { id: item.categoryId },
        });
        return {
          id: category!.id,
          name: category!.name,
          orders: Number(item.orderCount),
          revenue: item.revenue,
        };
      }),
    );

    // Последние заказы
    const recentOrders = await this.prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        status: true,
        user: true,
      },
    });

    // График заказов за последние 7 дней
    const ordersChart: Array<{
      date: string;
      orders: number;
      revenue: number;
    }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayStats = await this.getStatisticsForPeriod(date, nextDay);
      ordersChart.push({
        date: date.toISOString().split('T')[0],
        orders: dayStats.orders,
        revenue: dayStats.revenue,
      });
    }

    // Распределение заказов по статусам
    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['statusId'],
      _count: true,
    });

    const ordersByStatusWithDetails = await Promise.all(
      ordersByStatus.map(async (item) => {
        const status = await this.prisma.orderStatus.findUnique({
          where: { id: item.statusId },
        });
        return {
          status: status!.name,
          count: item._count,
          percentage: Math.round((item._count / totalOrders) * 100),
        };
      }),
    );

    return {
      overview: {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum?.totalAmount || 0),
        totalUsers,
        totalProducts,
        activeChats,
        pendingOrders,
      },
      periods: {
        today: todayStats,
        yesterday: yesterdayStats,
        week: weekStats,
        month: monthStats,
      },
      topProducts: topProductsWithDetails,
      topCategories,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: {
          id: order.status.id,
          name: order.status.name,
          color: order.status.color,
        },
        total: Number(order.totalAmount),
        createdAt: order.createdAt,
        user: {
          id: order.user.id,
          firstName: order.user.firstName || '',
          lastName: order.user.lastName || undefined,
          phone: order.user.phone,
        },
      })),
      ordersChart,
      ordersByStatus: ordersByStatusWithDetails,
    };
  }

  private async getStatisticsForPeriod(startDate: Date, endDate: Date) {
    const [orders, revenue, users] = await Promise.all([
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.CUSTOMER,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
    ]);

    return {
      orders,
      revenue: Number(revenue._sum?.totalAmount || 0),
      users,
    };
  }

  async getRevenueStatistics(period: PeriodStatisticsDto) {
    const where: any = {};

    if (period.startDate) {
      where.createdAt = { gte: new Date(period.startDate) };
    }

    if (period.endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(period.endDate) };
    }

    const revenue = await this.prisma.order.aggregate({
      where,
      _sum: { totalAmount: true },
      _avg: { totalAmount: true },
      _count: true,
    });

    return {
      total: Number(revenue._sum?.totalAmount || 0),
      average: Number(revenue._avg?.totalAmount || 0),
      count: revenue._count,
    };
  }

  async getProductStatistics() {
    const [total, active, outOfStock, lowStock] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { stock: 0 } }),
      this.prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } }),
    ]);

    return {
      total,
      active,
      outOfStock,
      lowStock,
    };
  }

  async getUserStatistics() {
    const [total, customers, managers, admins, activeToday] = await Promise.all(
      [
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
        this.prisma.user.count({ where: { role: UserRole.MANAGER } }),
        this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
        this.prisma.user.count({
          where: {
            orders: {
              some: {
                createdAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
            },
          },
        }),
      ],
    );

    return {
      total,
      byRole: {
        customers,
        managers,
        admins,
      },
      activeToday,
    };
  }
}
