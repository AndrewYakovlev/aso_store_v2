import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { Prisma } from '@prisma/client';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderDto,
  OrdersFilterDto,
  PaginatedOrdersDto,
  OrderStatusDto,
  DeliveryMethodDto,
  PaymentMethodDto,
} from './dto';
import { normalizePhone, formatPhoneForDisplay } from '../common/utils/phone.utils';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async create(
    userId: string | undefined,
    anonymousUserId: string | undefined,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderDto> {
    // Orders can only be created for registered users
    if (!userId) {
      throw new BadRequestException(
        'User must be authenticated to create order',
      );
    }

    // Get current cart
    const cart = await this.cartService.getCart(userId, anonymousUserId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Check delivery method exists
    const deliveryMethod = await this.prisma.deliveryMethod.findUnique({
      where: { id: createOrderDto.deliveryMethodId },
    });
    if (!deliveryMethod || !deliveryMethod.isActive) {
      throw new BadRequestException('Invalid delivery method');
    }

    // Check payment method exists
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: createOrderDto.paymentMethodId },
    });
    if (!paymentMethod || !paymentMethod.isActive) {
      throw new BadRequestException('Invalid payment method');
    }

    // Get default order status
    const newStatus = await this.prisma.orderStatus.findUnique({
      where: { code: 'new' },
    });
    if (!newStatus) {
      throw new Error('Default order status not found');
    }

    // Calculate total amount
    const totalAmount = cart.totalPrice;
    const deliveryAmount = deliveryMethod.price;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        statusId: newStatus.id,
        deliveryMethodId: createOrderDto.deliveryMethodId,
        paymentMethodId: createOrderDto.paymentMethodId,
        totalAmount,
        deliveryAmount,
        customerName: createOrderDto.customerName,
        customerPhone: normalizePhone(createOrderDto.customerPhone),
        customerEmail: createOrderDto.customerEmail,
        deliveryAddress: createOrderDto.deliveryAddress,
        deliveryCity: createOrderDto.deliveryCity,
        deliveryStreet: createOrderDto.deliveryStreet,
        deliveryBuilding: createOrderDto.deliveryBuilding,
        deliveryApartment: createOrderDto.deliveryApartment,
        deliveryPostalCode: createOrderDto.deliveryPostalCode,
        comment: createOrderDto.comment,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        status: true,
        deliveryMethod: true,
        paymentMethod: true,
        items: {
          include: {
            product: {
              include: {
                categories: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Clear cart after successful order creation
    await this.cartService.clearCart(userId, anonymousUserId);

    return this.mapToDto(order);
  }

  async findAll(
    userId: string | undefined,
    anonymousUserId: string | undefined,
    filter: OrdersFilterDto,
  ): Promise<PaginatedOrdersDto> {
    const {
      statusId,
      orderNumber,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where: Prisma.OrderWhereInput = {};

    // Filter by user - orders are only for authenticated users
    if (userId) {
      where.userId = userId;
    } else {
      // Return empty if no user identification
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Filter by status
    if (statusId) {
      where.statusId = statusId;
    }

    // Filter by order number
    if (orderNumber) {
      where.orderNumber = {
        contains: orderNumber,
        mode: 'insensitive',
      };
    }

    // Count total
    const total = await this.prisma.order.count({ where });

    // Get orders
    const orders = await this.prisma.order.findMany({
      where,
      include: {
        status: true,
        deliveryMethod: true,
        paymentMethod: true,
        items: {
          include: {
            product: {
              include: {
                categories: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: orders.map((order) => this.mapToDto(order)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(
    id: string,
    userId: string | undefined,
    anonymousUserId: string | undefined,
  ): Promise<OrderDto> {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        userId: userId || undefined,
      },
      include: {
        status: true,
        deliveryMethod: true,
        paymentMethod: true,
        items: {
          include: {
            product: {
              include: {
                categories: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapToDto(order);
  }

  async findByOrderNumber(
    orderNumber: string,
    userId: string | undefined,
    anonymousUserId: string | undefined,
  ): Promise<OrderDto> {
    const order = await this.prisma.order.findFirst({
      where: {
        orderNumber,
        userId: userId || undefined,
      },
      include: {
        status: true,
        deliveryMethod: true,
        paymentMethod: true,
        items: {
          include: {
            product: {
              include: {
                categories: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapToDto(order);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderDto> {
    // Check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if status exists
    const status = await this.prisma.orderStatus.findUnique({
      where: { id: updateStatusDto.statusId },
    });
    if (!status || !status.isActive) {
      throw new BadRequestException('Invalid status');
    }

    // Update order status
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { statusId: updateStatusDto.statusId },
      include: {
        status: true,
        deliveryMethod: true,
        paymentMethod: true,
        items: {
          include: {
            product: {
              include: {
                categories: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.mapToDto(updatedOrder);
  }

  async getOrderStatuses(): Promise<OrderStatusDto[]> {
    const statuses = await this.prisma.orderStatus.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return statuses.map((status) => ({
      id: status.id,
      code: status.code,
      name: status.name,
      sortOrder: status.sortOrder,
      isActive: status.isActive,
    }));
  }

  async getDeliveryMethods(): Promise<DeliveryMethodDto[]> {
    const methods = await this.prisma.deliveryMethod.findMany({
      where: { isActive: true },
    });

    return methods.map((method) => ({
      id: method.id,
      code: method.code,
      name: method.name,
      description: method.description || undefined,
      price: method.price.toNumber(),
      isActive: method.isActive,
    }));
  }

  async getPaymentMethods(): Promise<PaymentMethodDto[]> {
    const methods = await this.prisma.paymentMethod.findMany({
      where: { isActive: true },
    });

    return methods.map((method) => ({
      id: method.id,
      code: method.code,
      name: method.name,
      description: method.description || undefined,
      isActive: method.isActive,
    }));
  }

  private async generateOrderNumber(): Promise<string> {
    // Generate order number with format: YYYYMMDD-XXXX
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const prefix = `${year}${month}${day}`;

    // Get today's order count
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const orderNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;
    return orderNumber;
  }

  private mapToDto(order: any): OrderDto {
    const grandTotal =
      order.totalAmount.toNumber() + order.deliveryAmount.toNumber();

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: {
        id: order.status.id,
        code: order.status.code,
        name: order.status.name,
        sortOrder: order.status.sortOrder,
        isActive: order.status.isActive,
      },
      deliveryMethod: {
        id: order.deliveryMethod.id,
        code: order.deliveryMethod.code,
        name: order.deliveryMethod.name,
        description: order.deliveryMethod.description || undefined,
        price: order.deliveryMethod.price.toNumber(),
        isActive: order.deliveryMethod.isActive,
      },
      paymentMethod: {
        id: order.paymentMethod.id,
        code: order.paymentMethod.code,
        name: order.paymentMethod.name,
        description: order.paymentMethod.description || undefined,
        isActive: order.paymentMethod.isActive,
      },
      totalAmount: order.totalAmount.toNumber(),
      deliveryAmount: order.deliveryAmount.toNumber(),
      grandTotal,
      customerName: order.customerName,
      customerPhone: formatPhoneForDisplay(order.customerPhone),
      customerEmail: order.customerEmail || undefined,
      deliveryAddress: order.deliveryAddress || undefined,
      deliveryCity: order.deliveryCity || undefined,
      deliveryStreet: order.deliveryStreet || undefined,
      deliveryBuilding: order.deliveryBuilding || undefined,
      deliveryApartment: order.deliveryApartment || undefined,
      deliveryPostalCode: order.deliveryPostalCode || undefined,
      comment: order.comment || undefined,
      items: order.items.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId || undefined,
        offerId: item.offerId || undefined,
        product: item.product ? this.mapProductToDto(item.product) : undefined,
        quantity: item.quantity,
        price: item.price.toNumber(),
        totalPrice: item.price.toNumber() * item.quantity,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private mapProductToDto(product: any): any {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      description: product.description || undefined,
      price: product.price.toNumber(),
      stock: product.stock,
      isActive: product.isActive,
      images: product.images as string[],
      categories:
        product.categories?.map((pc: any) => ({
          id: pc.category.id,
          name: pc.category.name,
          slug: pc.category.slug,
          description: pc.category.description,
          parentId: pc.category.parentId,
          isActive: pc.category.isActive,
          sortOrder: pc.category.sortOrder,
        })) || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
