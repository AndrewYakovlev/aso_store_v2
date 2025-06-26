import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
} from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  // Общая статистика
  async getOverallStatistics() {
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      activeOrders,
      todayOrders,
      todayRevenue,
    ] = await Promise.all([
      // Общее количество заказов
      this.prisma.order.count(),

      // Общая выручка (только оплаченные заказы)
      this.prisma.order.aggregate({
        where: {
          OR: [
            { status: { name: 'completed' } },
            { status: { name: 'delivered' } },
          ],
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Количество уникальных клиентов
      this.prisma.user.count({
        where: {
          orders: {
            some: {},
          },
        },
      }),

      // Количество активных товаров
      this.prisma.product.count({
        where: {
          isActive: true,
        },
      }),

      // Активные заказы (не завершенные)
      this.prisma.order.count({
        where: {
          status: {
            name: {
              notIn: ['completed', 'cancelled', 'delivered'],
            },
          },
        },
      }),

      // Заказы за сегодня
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: startOfDay(new Date()),
            lte: endOfDay(new Date()),
          },
        },
      }),

      // Выручка за сегодня
      this.prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startOfDay(new Date()),
            lte: endOfDay(new Date()),
          },
          OR: [
            { status: { name: 'completed' } },
            { status: { name: 'delivered' } },
          ],
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: (
        totalRevenue._sum.totalAmount || new Decimal(0)
      ).toString(),
      totalCustomers,
      totalProducts,
      activeOrders,
      todayOrders,
      todayRevenue: (
        todayRevenue._sum.totalAmount || new Decimal(0)
      ).toString(),
    };
  }

  // Статистика по периодам
  async getPeriodicStatistics(period: 'day' | 'week' | 'month' = 'week') {
    const periods = this.generatePeriods(period);

    const statistics = await Promise.all(
      periods.map(async ({ start, end, label }) => {
        const [orders, revenue] = await Promise.all([
          this.prisma.order.count({
            where: {
              createdAt: {
                gte: start,
                lte: end,
              },
            },
          }),
          this.prisma.order.aggregate({
            where: {
              createdAt: {
                gte: start,
                lte: end,
              },
              OR: [
                { status: { name: 'completed' } },
                { status: { name: 'delivered' } },
              ],
            },
            _sum: {
              totalAmount: true,
            },
          }),
        ]);

        return {
          period: label,
          orders,
          revenue: (revenue._sum.totalAmount || new Decimal(0)).toString(),
        };
      }),
    );

    return statistics;
  }

  // Топ продаваемых товаров
  async getTopProducts(limit: number = 10) {
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _count: {
        _all: true,
      },
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    // Получаем информацию о товарах
    const productIds = topProducts
      .map((item) => item.productId)
      .filter((id) => id !== null);
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    const productsMap = new Map(products.map((p) => [p.id, p]));

    return topProducts
      .filter((item) => item.productId !== null)
      .map((item) => {
        const product = productsMap.get(item.productId!);
        const categoryName = product?.categories?.[0]?.category?.name || '';
        const quantity = item._sum?.quantity || 0;
        const price = item._sum?.price || new Decimal(0);
        const totalRevenue = new Decimal(price).mul(quantity);

        return {
          productId: item.productId as string,
          productName: product?.name || 'Товар удален',
          productSku: product?.sku || '',
          brand: product?.brand?.name || '',
          category: categoryName,
          orderCount: item._count?._all || 0,
          totalQuantity: quantity,
          totalRevenue: totalRevenue.toString(),
        };
      });
  }

  // Статистика по статусам заказов
  async getOrderStatusStatistics() {
    const statuses = await this.prisma.orderStatus.findMany({
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return statuses.map((status) => ({
      statusId: status.id,
      statusName: status.name,
      statusColor: status.color,
      orderCount: status._count.orders,
    }));
  }

  // Статистика по методам оплаты
  async getPaymentMethodStatistics() {
    const paymentMethods = await this.prisma.paymentMethod.findMany({
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const methodsWithRevenue = await Promise.all(
      paymentMethods.map(async (method) => {
        const revenue = await this.prisma.order.aggregate({
          where: {
            paymentMethodId: method.id,
            OR: [
              { status: { name: 'completed' } },
              { status: { name: 'delivered' } },
            ],
          },
          _sum: {
            totalAmount: true,
          },
        });

        return {
          methodId: method.id,
          methodName: method.name,
          orderCount: method._count.orders,
          totalRevenue: (revenue._sum.totalAmount || new Decimal(0)).toString(),
        };
      }),
    );

    return methodsWithRevenue;
  }

  // Статистика по новым клиентам
  async getNewCustomersStatistics(days: number = 30) {
    const startDate = subDays(new Date(), days);

    const newCustomers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const customersWithOrders = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
        },
        orders: {
          some: {},
        },
      },
    });

    return {
      newCustomers,
      customersWithOrders,
      conversionRate:
        newCustomers > 0 ? (customersWithOrders / newCustomers) * 100 : 0,
    };
  }

  // Вспомогательный метод для генерации периодов
  private generatePeriods(
    period: 'day' | 'week' | 'month',
  ): Array<{ start: Date; end: Date; label: string }> {
    const periods: Array<{ start: Date; end: Date; label: string }> = [];
    const now = new Date();

    switch (period) {
      case 'day':
        // Последние 7 дней
        for (let i = 6; i >= 0; i--) {
          const date = subDays(now, i);
          periods.push({
            start: startOfDay(date),
            end: endOfDay(date),
            label: date.toLocaleDateString('ru-RU', {
              weekday: 'short',
              day: 'numeric',
            }),
          });
        }
        break;
      case 'week':
        // Последние 4 недели
        for (let i = 3; i >= 0; i--) {
          const weekStart = startOfWeek(subDays(now, i * 7), {
            weekStartsOn: 1,
          });
          const weekEnd = endOfWeek(subDays(now, i * 7), { weekStartsOn: 1 });
          periods.push({
            start: weekStart,
            end: weekEnd,
            label: `Неделя ${i + 1}`,
          });
        }
        break;
      case 'month':
        // Последние 6 месяцев
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          periods.push({
            start: startOfMonth(monthDate),
            end: endOfMonth(monthDate),
            label: monthDate.toLocaleDateString('ru-RU', { month: 'short' }),
          });
        }
        break;
    }

    return periods;
  }
}
