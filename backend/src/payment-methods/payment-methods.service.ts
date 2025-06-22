import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.prisma.paymentMethod.create({
      data: createPaymentMethodDto,
    });
  }

  async findAll(onlyActive: boolean = false) {
    return this.prisma.paymentMethod.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!method) {
      throw new NotFoundException('Метод оплаты не найден');
    }

    return method;
  }

  async update(id: string, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    await this.findOne(id);

    return this.prisma.paymentMethod.update({
      where: { id },
      data: updatePaymentMethodDto,
    });
  }

  async remove(id: string) {
    const method = await this.findOne(id);

    // Проверяем, используется ли метод в заказах
    const ordersCount = await this.prisma.order.count({
      where: { paymentMethodId: id },
    });

    if (ordersCount > 0) {
      throw new ConflictException(
        `Невозможно удалить метод оплаты, так как он используется в ${ordersCount} заказах. Вы можете деактивировать его.`,
      );
    }

    await this.prisma.paymentMethod.delete({
      where: { id },
    });

    return { message: 'Метод оплаты успешно удален' };
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.paymentMethod.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return { message: 'Порядок сортировки обновлен' };
  }
}
