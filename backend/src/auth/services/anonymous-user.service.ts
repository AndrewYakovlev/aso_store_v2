import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from './jwt.service';
import { AnonymousUser } from '@prisma/client';

@Injectable()
export class AnonymousUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createAnonymousUser(): Promise<{ user: AnonymousUser; token: string }> {
    // Generate a unique token first
    const tempId = this.generateTempId();
    const token = await this.jwtService.generateAnonymousToken(tempId);

    const anonymousUser = await this.prisma.anonymousUser.create({
      data: {
        id: tempId,
        token: token,
      },
    });

    return { user: anonymousUser, token };
  }

  private generateTempId(): string {
    // Generate a UUID-like ID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async findByToken(token: string): Promise<AnonymousUser | null> {
    try {
      const payload = await this.jwtService.verifyAnonymousToken(token);

      const anonymousUser = await this.prisma.anonymousUser.findUnique({
        where: { id: payload.sub },
      });

      if (anonymousUser) {
        // Update last activity
        await this.prisma.anonymousUser.update({
          where: { id: anonymousUser.id },
          data: { lastActivity: new Date() },
        });
      }

      return anonymousUser;
    } catch {
      return null;
    }
  }

  async mergeWithUser(anonymousUserId: string, userId: string): Promise<void> {
    // Start transaction to merge anonymous user data with authenticated user
    await this.prisma.$transaction(async (tx) => {
      // Update anonymous user with userId
      await tx.anonymousUser.update({
        where: { id: anonymousUserId },
        data: { userId },
      });

      // Merge carts
      const anonymousCart = await tx.cart.findUnique({
        where: { anonymousUserId },
        include: { items: true },
      });

      if (anonymousCart) {
        // Check if user already has a cart
        const userCart = await tx.cart.findUnique({
          where: { userId },
        });

        if (userCart) {
          // Move items from anonymous cart to user cart
          await tx.cartItem.updateMany({
            where: { cartId: anonymousCart.id },
            data: { cartId: userCart.id },
          });

          // Delete anonymous cart
          await tx.cart.delete({
            where: { id: anonymousCart.id },
          });
        } else {
          // Transfer cart ownership
          await tx.cart.update({
            where: { id: anonymousCart.id },
            data: {
              userId,
              anonymousUserId: null,
            },
          });
        }
      }

      // Merge favorites
      const anonymousFavorites = await tx.favorite.findMany({
        where: { anonymousUserId },
      });

      for (const favorite of anonymousFavorites) {
        // Check if user already has this favorite
        const existingFavorite = await tx.favorite.findUnique({
          where: {
            userId_productId: {
              userId,
              productId: favorite.productId,
            },
          },
        });

        if (!existingFavorite) {
          // Transfer favorite to user
          await tx.favorite.update({
            where: { id: favorite.id },
            data: {
              userId,
              anonymousUserId: null,
            },
          });
        } else {
          // Delete duplicate anonymous favorite
          await tx.favorite.delete({
            where: { id: favorite.id },
          });
        }
      }

      // Transfer chats
      await tx.chat.updateMany({
        where: { anonymousUserId },
        data: {
          userId,
          anonymousUserId: null,
        },
      });
    });
  }
}
