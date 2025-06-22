import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddFavoriteDto, FavoriteDto } from './dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addToFavorites(
    userId: string | undefined,
    anonymousUserId: string | undefined,
    addFavoriteDto: AddFavoriteDto,
  ): Promise<FavoriteDto> {
    const { productId } = addFavoriteDto;

    // Check if we have user identification
    if (!userId && !anonymousUserId) {
      throw new BadRequestException('User identification required');
    }

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Build where condition based on user type
    const whereCondition: any = { productId };
    if (userId) {
      whereCondition.userId = userId;
    } else {
      whereCondition.anonymousUserId = anonymousUserId;
    }

    // Check if already in favorites
    const existing = await this.prisma.favorite.findFirst({
      where: whereCondition,
    });
    if (existing) {
      throw new ConflictException('Product already in favorites');
    }

    // Create favorite
    const data: any = { productId };
    if (userId) {
      data.userId = userId;
    } else {
      data.anonymousUserId = anonymousUserId;
    }

    const favorite = await this.prisma.favorite.create({
      data,
      include: {
        product: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            specifications: true,
            attributes: {
              include: {
                attribute: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.mapToDto(favorite);
  }

  async removeFromFavorites(
    userId: string | undefined,
    anonymousUserId: string | undefined,
    productId: string,
  ): Promise<void> {
    // Check if we have user identification
    if (!userId && !anonymousUserId) {
      throw new BadRequestException('User identification required');
    }

    // Build where condition based on user type
    const whereCondition: any = { productId };
    if (userId) {
      whereCondition.userId = userId;
    } else {
      whereCondition.anonymousUserId = anonymousUserId;
    }

    const favorite = await this.prisma.favorite.findFirst({
      where: whereCondition,
    });

    if (!favorite) {
      throw new NotFoundException('Product not in favorites');
    }

    await this.prisma.favorite.delete({
      where: { id: favorite.id },
    });
  }

  async getFavorites(
    userId: string | undefined,
    anonymousUserId: string | undefined,
  ): Promise<FavoriteDto[]> {
    // Check if we have user identification
    if (!userId && !anonymousUserId) {
      return [];
    }

    // Build where condition based on user type
    const whereCondition: any = {};
    if (userId) {
      whereCondition.userId = userId;
    } else {
      whereCondition.anonymousUserId = anonymousUserId;
    }

    const favorites = await this.prisma.favorite.findMany({
      where: whereCondition,
      include: {
        product: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            specifications: true,
            attributes: {
              include: {
                attribute: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return favorites.map((favorite) => this.mapToDto(favorite));
  }

  async getFavoriteIds(
    userId: string | undefined,
    anonymousUserId: string | undefined,
  ): Promise<string[]> {
    // Check if we have user identification
    if (!userId && !anonymousUserId) {
      return [];
    }

    // Build where condition based on user type
    const whereCondition: any = {};
    if (userId) {
      whereCondition.userId = userId;
    } else {
      whereCondition.anonymousUserId = anonymousUserId;
    }

    const favorites = await this.prisma.favorite.findMany({
      where: whereCondition,
      select: {
        productId: true,
      },
    });

    return favorites.map((f) => f.productId);
  }

  async isFavorite(
    userId: string | undefined,
    anonymousUserId: string | undefined,
    productId: string,
  ): Promise<boolean> {
    // Check if we have user identification
    if (!userId && !anonymousUserId) {
      return false;
    }

    // Build where condition based on user type
    const whereCondition: any = { productId };
    if (userId) {
      whereCondition.userId = userId;
    } else {
      whereCondition.anonymousUserId = anonymousUserId;
    }

    const favorite = await this.prisma.favorite.findFirst({
      where: whereCondition,
    });

    return !!favorite;
  }

  // Merge anonymous user favorites to authenticated user
  async mergeFavorites(anonymousUserId: string, userId: string): Promise<void> {
    // Get all anonymous user favorites
    const anonymousFavorites = await this.prisma.favorite.findMany({
      where: { anonymousUserId },
      select: { productId: true },
    });

    // Get all user favorites to avoid duplicates
    const userFavorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { productId: true },
    });

    const userProductIds = new Set(userFavorites.map((f) => f.productId));

    // Add only new favorites
    const newFavorites = anonymousFavorites
      .filter((f) => !userProductIds.has(f.productId))
      .map((f) => ({
        userId,
        productId: f.productId,
      }));

    if (newFavorites.length > 0) {
      await this.prisma.favorite.createMany({
        data: newFavorites,
      });
    }

    // Delete anonymous favorites
    await this.prisma.favorite.deleteMany({
      where: { anonymousUserId },
    });
  }

  private mapToDto(favorite: any): FavoriteDto {
    return {
      id: favorite.id,
      productId: favorite.productId,
      product: {
        id: favorite.product.id,
        sku: favorite.product.sku,
        name: favorite.product.name,
        slug: favorite.product.slug,
        description: favorite.product.description,
        price: favorite.product.price.toNumber(),
        stock: favorite.product.stock,
        isActive: favorite.product.isActive,
        excludeFromPromoCodes: favorite.product.excludeFromPromoCodes || false,
        images: favorite.product.images as string[],
        categories:
          favorite.product.categories?.map((pc: any) => ({
            id: pc.category.id,
            name: pc.category.name,
            slug: pc.category.slug,
            description: pc.category.description,
            parentId: pc.category.parentId,
            isActive: pc.category.isActive,
            sortOrder: pc.category.sortOrder,
          })) || [],
        createdAt: favorite.product.createdAt,
        updatedAt: favorite.product.updatedAt,
      },
      createdAt: favorite.createdAt,
    };
  }
}
