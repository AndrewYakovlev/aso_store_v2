import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderStatusDto, UpdateOrderStatusDto } from './dto';

@Injectable()
export class OrderStatusesService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderStatusDto: CreateOrderStatusDto) {
    // Проверяем уникальность кода
    const existingStatus = await this.prisma.orderStatus.findUnique({
      where: { code: createOrderStatusDto.code },
    });

    if (existingStatus) {
      throw new ConflictException('Статус с таким кодом уже существует');
    }

    return this.prisma.orderStatus.create({
      data: createOrderStatusDto,
    });
  }

  async findAll(onlyActive: boolean = false) {
    return this.prisma.orderStatus.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const status = await this.prisma.orderStatus.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!status) {
      throw new NotFoundException('Статус заказа не найден');
    }

    return status;
  }

  async findByCode(code: string) {
    const status = await this.prisma.orderStatus.findUnique({
      where: { code },
    });

    if (!status) {
      throw new NotFoundException('Статус заказа не найден');
    }

    return status;
  }

  async update(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    await this.findOne(id);

    return this.prisma.orderStatus.update({
      where: { id },
      data: updateOrderStatusDto,
    });
  }

  async remove(id: string) {
    const status = await this.findOne(id);

    // Проверяем, является ли статус системным (первые статусы обычно системные)
    const systemStatuses = [
      'NEW',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];
    if (systemStatuses.includes(status.code)) {
      throw new ConflictException('Невозможно удалить системный статус');
    }

    // Проверяем, используется ли статус в заказах
    const ordersCount = await this.prisma.order.count({
      where: { statusId: id },
    });

    if (ordersCount > 0) {
      throw new ConflictException(
        `Невозможно удалить статус, так как он используется в ${ordersCount} заказах. Вы можете деактивировать его.`,
      );
    }

    await this.prisma.orderStatus.delete({
      where: { id },
    });

    return { message: 'Статус заказа успешно удален' };
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.orderStatus.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return { message: 'Порядок сортировки обновлен' };
  }

  async getTransitions(fromStatusId: string) {
    // Получаем текущий статус
    const fromStatus = await this.findOne(fromStatusId);

    // Если статус финальный, переходы невозможны
    if (fromStatus.isFinal) {
      return [];
    }

    // Возвращаем все активные статусы, кроме текущего
    return this.prisma.orderStatus.findMany({
      where: {
        id: { not: fromStatusId },
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
