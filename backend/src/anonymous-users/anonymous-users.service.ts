import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { AnonymousUserFilterDto } from './dto/anonymous-user-filter.dto';

@Injectable()
export class AnonymousUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    filter: AnonymousUserFilterDto,
  ): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'lastActivity',
      sortOrder = 'desc',
    } = filter;

    // Ensure page and limit are numbers
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const where: Prisma.AnonymousUserWhereInput = {};

    if (search) {
      where.token = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.prisma.anonymousUser.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          _count: {
            select: {
              carts: true,
              favorites: true,
              chats: true,
            },
          },
        },
      }),
      this.prisma.anonymousUser.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      data,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.anonymousUser.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            carts: true,
            favorites: true,
            chats: true,
          },
        },
        carts: {
          include: {
            items: {
              include: {
                product: true,
                offer: true,
              },
            },
          },
          take: 5,
          orderBy: { updatedAt: 'desc' },
        },
        favorites: {
          include: {
            product: true,
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        chats: {
          take: 5,
          orderBy: { updatedAt: 'desc' },
        },
      },
    });
  }

  async remove(id: string) {
    // Delete all related data in transaction
    return this.prisma.$transaction(async (tx) => {
      // Delete cart items first
      await tx.cartItem.deleteMany({
        where: {
          cart: {
            anonymousUserId: id,
          },
        },
      });

      // Delete carts
      await tx.cart.deleteMany({
        where: { anonymousUserId: id },
      });

      // Delete favorites
      await tx.favorite.deleteMany({
        where: { anonymousUserId: id },
      });

      // Delete chat messages
      await tx.chatMessage.deleteMany({
        where: {
          chat: {
            anonymousUserId: id,
          },
        },
      });

      // Delete chats
      await tx.chat.deleteMany({
        where: { anonymousUserId: id },
      });

      // Finally delete the anonymous user
      return tx.anonymousUser.delete({
        where: { id },
      });
    });
  }
}
