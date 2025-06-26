import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PromoCode, Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  eligibleAmount?: number;
  discountAmount?: number;
}

export interface CartItemForValidation {
  productId?: string;
  offerId?: string;
  quantity: number;
  product?: {
    price: Decimal;
    excludeFromPromoCodes: boolean;
  };
  offer?: {
    price: Decimal;
  };
}

@Injectable()
export class PromoCodeValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validatePromoCode(
    code: string,
    userId: string | null,
    cartItems: CartItemForValidation[],
  ): Promise<ValidationResult> {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!promoCode) {
      return { isValid: false, error: 'Промокод не найден' };
    }

    // Check if active
    if (!promoCode.isActive) {
      return { isValid: false, error: 'Промокод не активен' };
    }

    // Check validity period
    const now = new Date();
    if (promoCode.validFrom > now) {
      return { isValid: false, error: 'Промокод еще не действует' };
    }

    if (promoCode.validUntil && promoCode.validUntil < now) {
      return { isValid: false, error: 'Срок действия промокода истек' };
    }

    // Check total usage limit
    if (
      promoCode.maxUsesTotal !== null &&
      promoCode._count.usages >= promoCode.maxUsesTotal
    ) {
      return { isValid: false, error: 'Промокод больше не действителен' };
    }

    // Check user-specific conditions
    if (userId) {
      // Check user usage limit
      const userUsageCount = await this.prisma.promoCodeUsage.count({
        where: {
          promoCodeId: promoCode.id,
          userId,
        },
      });

      if (userUsageCount >= promoCode.maxUsesPerUser) {
        return {
          isValid: false,
          error: 'Вы уже использовали этот промокод',
        };
      }

      // Check first order only
      if (promoCode.firstOrderOnly) {
        const userOrderCount = await this.prisma.order.count({
          where: { userId },
        });

        if (userOrderCount > 0) {
          return {
            isValid: false,
            error: 'Промокод доступен только для первого заказа',
          };
        }
      }

      // Check if personal promo code
      if (!promoCode.isPublic) {
        const hasAccess = await this.prisma.userPromoCode.findUnique({
          where: {
            userId_promoCodeId: {
              userId,
              promoCodeId: promoCode.id,
            },
          },
        });

        if (!hasAccess) {
          return {
            isValid: false,
            error: 'У вас нет доступа к этому промокоду',
          };
        }
      }
    } else {
      // Anonymous user checks
      if (!promoCode.isPublic) {
        return {
          isValid: false,
          error: 'Промокод требует авторизации',
        };
      }

      if (promoCode.firstOrderOnly) {
        return {
          isValid: false,
          error: 'Промокод требует авторизации',
        };
      }
    }

    // Calculate eligible amount (excluding products with excludeFromPromoCodes)
    let eligibleAmount = 0;

    for (const item of cartItems) {
      let itemPrice: number;
      let excludeFromPromo = false;

      if (item.productId && item.product) {
        itemPrice = item.product.price.toNumber();
        excludeFromPromo = item.product.excludeFromPromoCodes;
      } else if (item.offerId && item.offer) {
        itemPrice = item.offer.price.toNumber();
        // Product offers are always eligible for promo codes
        excludeFromPromo = false;
      } else {
        continue;
      }

      if (!excludeFromPromo) {
        eligibleAmount += itemPrice * item.quantity;
      }
    }

    // Check minimum order amount
    if (
      promoCode.minOrderAmount &&
      eligibleAmount < promoCode.minOrderAmount.toNumber()
    ) {
      return {
        isValid: false,
        error: `Минимальная сумма заказа для применения промокода: ${promoCode.minOrderAmount} ₽`,
      };
    }

    // Calculate discount
    let discountAmount: number;
    if (promoCode.discountType === 'FIXED_AMOUNT') {
      discountAmount = Math.min(
        promoCode.discountValue.toNumber(),
        eligibleAmount,
      );
    } else {
      // PERCENTAGE
      discountAmount =
        (eligibleAmount * promoCode.discountValue.toNumber()) / 100;
    }

    return {
      isValid: true,
      eligibleAmount,
      discountAmount,
    };
  }

  async applyPromoCode(
    promoCodeId: string,
    orderId: string,
    userId: string | null,
    orderAmount: number,
    discountAmount: number,
  ): Promise<void> {
    await this.prisma.promoCodeUsage.create({
      data: {
        promoCodeId,
        orderId,
        userId,
        orderAmount: new Decimal(orderAmount),
        discountAmount: new Decimal(discountAmount),
      },
    });
  }
}
