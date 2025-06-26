import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from './dto';
import { Prisma, UserRole } from '@prisma/client';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { normalizePhone } from '../common/utils/phone.utils';
import { CartService } from '../cart/cart.service';
import { FavoritesService } from '../favorites/favorites.service';
import { ChatsService } from '../chats/chats.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => CartService))
    private cartService: CartService,
    @Inject(forwardRef(() => FavoritesService))
    private favoritesService: FavoritesService,
    @Inject(forwardRef(() => ChatsService))
    private chatsService: ChatsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const phone = normalizePhone(createUserDto.phone);

    // Проверяем, существует ли пользователь с таким телефоном
    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким телефоном уже существует',
      );
    }

    // Преобразуем пустые строки в undefined
    const cleanedData: Partial<CreateUserDto> = {};
    (Object.keys(createUserDto) as Array<keyof CreateUserDto>).forEach(
      (key) => {
        const value = createUserDto[key];
        if (value === '') {
          // Пропускаем пустые строки, что эквивалентно undefined
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          cleanedData[key] = value as any;
        }
      },
    );

    return this.prisma.user.create({
      data: {
        ...cleanedData,
        phone,
      },
    });
  }

  async findAll(filter: UserFilterDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      createdFrom,
      createdTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { phone: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo);
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              orders: true,
              chats: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            chats: true,
            favorites: true,
            anonymousUsers: true,
          },
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        anonymousUsers: {
          take: 5,
          orderBy: { lastActivity: 'desc' },
          include: {
            _count: {
              select: {
                carts: true,
                favorites: true,
                chats: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    // Если меняется телефон, проверяем его уникальность
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const phone = normalizePhone(updateUserDto.phone);
      const existingUser = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser) {
        throw new ConflictException(
          'Пользователь с таким телефоном уже существует',
        );
      }

      updateUserDto.phone = phone;
    }

    // Преобразуем пустые строки в undefined
    const cleanedData: Partial<UpdateUserDto> = {};
    (Object.keys(updateUserDto) as Array<keyof UpdateUserDto>).forEach(
      (key) => {
        const value = updateUserDto[key];
        if (value === '') {
          // Пропускаем пустые строки, что эквивалентно undefined
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          cleanedData[key] = value as any;
        }
      },
    );

    return this.prisma.user.update({
      where: { id },
      data: cleanedData,
    });
  }

  async remove(id: string) {
    // Проверяем, существует ли пользователь
    await this.findOne(id);

    // Проверяем, можно ли удалить пользователя
    const ordersCount = await this.prisma.order.count({
      where: { userId: id },
    });

    if (ordersCount > 0) {
      throw new ConflictException('Невозможно удалить пользователя с заказами');
    }

    // Удаляем связанные данные
    await this.prisma.$transaction([
      this.prisma.favorite.deleteMany({ where: { userId: id } }),
      this.prisma.cartItem.deleteMany({ where: { cart: { userId: id } } }),
      this.prisma.cart.deleteMany({ where: { userId: id } }),
      this.prisma.user.delete({ where: { id } }),
    ]);

    return { message: 'Пользователь успешно удален' };
  }

  async getStatistics() {
    const [total, byUserRole, recentRegistrations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // За последние 30 дней
          },
        },
      }),
    ]);

    return {
      total,
      byRole: byUserRole.reduce(
        (acc, { role, _count }) => ({ ...acc, [role]: _count }),
        {},
      ),
      recentRegistrations,
    };
  }

  async findOrCreateByPhone(phone: string, _name?: string): Promise<any> {
    const normalizedPhone = normalizePhone(phone);

    // Попробуем найти существующего пользователя
    let user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: {
        _count: {
          select: {
            orders: true,
            chats: true,
            favorites: true,
          },
        },
      },
    });

    let isNewUser = false;
    let orderStats: {
      count: number;
      totalAmount: number;
      lastOrderDate: Date | null;
    } | null = null;

    // Если найден существующий пользователь, получаем статистику заказов
    if (user) {
      const orders = await this.prisma.order.findMany({
        where: { userId: user.id },
        select: {
          totalAmount: true,
          createdAt: true,
        },
      });

      orderStats = {
        count: orders.length,
        totalAmount: orders.reduce(
          (sum, order) => sum + order.totalAmount.toNumber(),
          0,
        ),
        lastOrderDate:
          orders.length > 0
            ? orders.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
              )[0].createdAt
            : null,
      };
    } else {
      // Если не найден, создаем нового
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          phone: normalizedPhone,
          firstName: 'Клиент', // Всегда устанавливаем "Клиент" для новых пользователей
          isPhoneVerified: true, // Менеджер создает пользователя, подтверждение не требуется
          role: UserRole.CUSTOMER,
        },
        include: {
          _count: {
            select: {
              orders: true,
              chats: true,
              favorites: true,
            },
          },
        },
      });

      orderStats = {
        count: 0,
        totalAmount: 0,
        lastOrderDate: null,
      };
    }

    return {
      ...user,
      isNewUser,
      orderStats,
    };
  }

  async getUserCart(userId: string) {
    // Проверяем существование пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Используем метод из CartService
    return this.cartService.getCart(userId, undefined);
  }

  async getUserFavorites(userId: string) {
    // Проверяем существование пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Используем метод из FavoritesService
    return this.favoritesService.getFavorites(userId, undefined);
  }

  async getUserChats(userId: string) {
    // Проверяем существование пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Используем метод из ChatsService
    return this.chatsService.getUserChats(userId, null);
  }

  async getUserAnonymousUsers(userId: string) {
    // Проверяем существование пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Получаем связанных анонимных пользователей
    const anonymousUsers = await this.prisma.anonymousUser.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            carts: true,
            favorites: true,
            chats: true,
          },
        },
      },
      orderBy: { lastActivity: 'desc' },
    });

    return anonymousUsers;
  }
}
