import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryMethodDto, UpdateDeliveryMethodDto } from './dto';

@Injectable()
export class DeliveryMethodsService {
  constructor(private prisma: PrismaService) {}

  async create(createDeliveryMethodDto: CreateDeliveryMethodDto) {
    return this.prisma.deliveryMethod.create({
      data: createDeliveryMethodDto,
    });
  }

  async findAll(onlyActive: boolean = false) {
    const methods = await this.prisma.deliveryMethod.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    // Update pickup method description with actual address
    const mainAddress = await this.prisma.storeAddress.findFirst({
      where: { type: 'main', isActive: true },
    });

    if (mainAddress) {
      const pickupMethod = methods.find(m => m.code === 'pickup');
      if (pickupMethod) {
        const addressParts = [
          'г.',
          mainAddress.city,
          mainAddress.street,
          'д.',
          mainAddress.building,
        ];
        if (mainAddress.office) {
          addressParts.push('офис', mainAddress.office);
        }
        pickupMethod.description = `Самовывоз из магазина по адресу: ${addressParts.join(' ')}`;
      }
    }

    return methods;
  }

  async findOne(id: string) {
    const method = await this.prisma.deliveryMethod.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!method) {
      throw new NotFoundException('Метод доставки не найден');
    }

    return method;
  }

  async update(id: string, updateDeliveryMethodDto: UpdateDeliveryMethodDto) {
    await this.findOne(id);

    return this.prisma.deliveryMethod.update({
      where: { id },
      data: updateDeliveryMethodDto,
    });
  }

  async remove(id: string) {
    const method = await this.findOne(id);

    // Проверяем, используется ли метод в заказах
    const ordersCount = await this.prisma.order.count({
      where: { deliveryMethodId: id },
    });

    if (ordersCount > 0) {
      throw new ConflictException(
        `Невозможно удалить метод доставки, так как он используется в ${ordersCount} заказах. Вы можете деактивировать его.`,
      );
    }

    await this.prisma.deliveryMethod.delete({
      where: { id },
    });

    return { message: 'Метод доставки успешно удален' };
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.deliveryMethod.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return { message: 'Порядок сортировки обновлен' };
  }
}
