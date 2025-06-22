import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { PromoCodeValidationService } from '../promo-codes/promo-code-validation.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  CartDto,
  CartItemDto,
  CartSummaryDto,
  CartProductOfferDto,
} from './dto';
import { ProductDto } from '../products/dto';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    @Inject(forwardRef(() => PromoCodeValidationService))
    private promoCodeValidation: PromoCodeValidationService,
    @Inject(forwardRef(() => PromoCodesService))
    private promoCodesService: PromoCodesService,
  ) {}

  private async getOrCreateCart(
    userId: string | undefined,
    anonymousUserId: string | undefined,
  ) {
    console.log('getOrCreateCart - input:', { userId, anonymousUserId });

    if (!userId && !anonymousUserId) {
      throw new BadRequestException('User identification required');
    }

    try {
      let cart = await this.prisma.cart.findFirst({
        where: {
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(anonymousUserId ? [{ anonymousUserId }] : []),
          ],
        },
      });

      if (!cart) {
        console.log('Creating new cart for:', { userId, anonymousUserId });
        cart = await this.prisma.cart.create({
          data: {
            ...(userId && { userId }),
            ...(anonymousUserId && { anonymousUserId }),
          },
        });
      }

      return cart;
    } catch (error) {
      console.error('Error in getOrCreateCart:', error);
      throw error;
    }
  }

  async getCart(
    userId: string | undefined,
    anonymousUserId: string | undefined,
  ): Promise<CartDto> {
    console.log('getCart called with:', { userId, anonymousUserId });
    const cart = await this.getOrCreateCart(userId, anonymousUserId);

    const cartWithItems = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
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
            offer: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!cartWithItems) {
      throw new NotFoundException('Cart not found');
    }

    return this.formatCart(cartWithItems);
  }

  async addToCart(
    userId: string | undefined,
    anonymousUserId: string | undefined,
    addToCartDto: AddToCartDto,
  ): Promise<CartItemDto> {
    const cart = await this.getOrCreateCart(userId, anonymousUserId);

    // Validate that either productId or offerId is provided, but not both
    if (!addToCartDto.productId && !addToCartDto.offerId) {
      throw new BadRequestException('Either productId or offerId must be provided');
    }
    if (addToCartDto.productId && addToCartDto.offerId) {
      throw new BadRequestException('Cannot provide both productId and offerId');
    }

    let productId: string | undefined;
    let offerId: string | undefined;

    if (addToCartDto.productId) {
      // Check if product exists and is available
      const product = await this.prisma.product.findUnique({
        where: { id: addToCartDto.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.stock < addToCartDto.quantity) {
        throw new BadRequestException('Insufficient stock');
      }

      productId = addToCartDto.productId;
    } else if (addToCartDto.offerId) {
      // Check if offer exists and is active
      const offer = await this.prisma.productOffer.findUnique({
        where: { id: addToCartDto.offerId },
      });

      if (!offer) {
        throw new NotFoundException('Product offer not found');
      }

      if (!offer.isActive) {
        throw new BadRequestException('Product offer is no longer active');
      }

      if (offer.expiresAt && new Date(offer.expiresAt) < new Date()) {
        throw new BadRequestException('Product offer has expired');
      }

      offerId = addToCartDto.offerId;
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        ...(productId && { productId }),
        ...(offerId && { offerId }),
      },
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + addToCartDto.quantity;

      if (productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: productId },
        });
        if (product && product.stock < newQuantity) {
          throw new BadRequestException('Insufficient stock');
        }
      }

      cartItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              categories: {
                include: {
                  category: true,
                },
              },
              specifications: true,
            },
          },
          offer: true,
        },
      });
    } else {
      // Create new cart item
      cartItem = await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          ...(productId && { productId }),
          ...(offerId && { offerId }),
          quantity: addToCartDto.quantity,
        },
        include: {
          product: {
            include: {
              categories: {
                include: {
                  category: true,
                },
              },
              specifications: true,
            },
          },
          offer: true,
        },
      });
    }

    return this.formatCartItem(cartItem);
  }

  async updateCartItem(
    userId: string | undefined,
    anonymousUserId: string | undefined,
    productId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItemDto> {
    const cart = await this.getOrCreateCart(userId, anonymousUserId);

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (!cartItem.product) {
      throw new NotFoundException('Product not found');
    }

    if (cartItem.product.stock < updateCartItemDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const updatedItem = await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: updateCartItemDto.quantity },
      include: {
        product: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            specifications: true,
          },
        },
      },
    });

    return this.formatCartItem(updatedItem);
  }

  async updateOfferCartItem(
    userId: string | undefined,
    anonymousUserId: string | undefined,
    offerId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItemDto> {
    const cart = await this.getOrCreateCart(userId, anonymousUserId);

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        offerId,
      },
      include: {
        offer: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Check if offer is still active and not cancelled
    if (cartItem.offer && (cartItem.offer.isCancelled || !cartItem.offer.isActive)) {
      throw new BadRequestException('This offer is no longer available');
    }

    const updatedItem = await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: {
        quantity: updateCartItemDto.quantity,
      },
      include: {
        offer: true,
      },
    });

    return this.formatCartItem(updatedItem);
  }

  async removeFromCart(
    userId: string | undefined,
    anonymousUserId: string | undefined,
    productId: string,
  ): Promise<void> {
    const cart = await this.getOrCreateCart(userId, anonymousUserId);

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });
  }

  async removeOfferFromCart(
    userId: string | undefined,
    anonymousUserId: string | undefined,
    offerId: string,
  ): Promise<void> {
    const cart = await this.getOrCreateCart(userId, anonymousUserId);

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        offerId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });
  }

  async clearCart(
    userId: string | undefined,
    anonymousUserId: string | undefined,
  ): Promise<void> {
    const cart = await this.getOrCreateCart(userId, anonymousUserId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }


  async mergeCarts(anonymousUserId: string, userId: string): Promise<void> {
    const anonymousCart = await this.prisma.cart.findFirst({
      where: { anonymousUserId },
      include: { items: true },
    });

    if (!anonymousCart || anonymousCart.items.length === 0) {
      return;
    }

    const userCart = await this.getOrCreateCart(userId, undefined);

    // Get existing items in user cart
    const existingItems = await this.prisma.cartItem.findMany({
      where: { cartId: userCart.id },
    });

    const existingProductIds = new Map(
      existingItems.map((item) => [item.productId, item]),
    );

    // Get existing items with offers
    const existingOfferIds = new Map(
      existingItems.filter(item => item.offerId).map((item) => [item.offerId, item]),
    );

    // Merge items
    for (const item of anonymousCart.items) {
      if (item.productId) {
        const existingItem = existingProductIds.get(item.productId);

        if (existingItem) {
          // Update quantity
          await this.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity + item.quantity,
            },
          });
        } else {
          // Create new item in user cart
          await this.prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }
      } else if (item.offerId) {
        const existingItem = existingOfferIds.get(item.offerId);

        if (existingItem) {
          // Update quantity
          await this.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity + item.quantity,
            },
          });
        } else {
          // Create new item in user cart
          await this.prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              offerId: item.offerId,
              quantity: item.quantity,
            },
          });
        }
      }
    }

    // Delete anonymous cart and its items
    await this.prisma.cartItem.deleteMany({
      where: { cartId: anonymousCart.id },
    });

    await this.prisma.cart.delete({
      where: { id: anonymousCart.id },
    });
  }

  private formatCart(cart: any): CartDto {
    const items = cart.items.map((item: any) => this.formatCartItem(item));
    const totalQuantity = items.reduce(
      (sum: number, item: CartItemDto) => sum + item.quantity,
      0,
    );
    const totalPrice = items.reduce(
      (sum: number, item: CartItemDto) => {
        if (item.product) {
          return sum + item.product.price * item.quantity;
        } else if (item.offer) {
          const price = typeof item.offer.price === 'number' ? item.offer.price : Number(item.offer.price);
          return sum + price * item.quantity;
        }
        return sum;
      },
      0,
    );

    return {
      id: cart.id,
      userId: cart.userId || undefined,
      anonymousUserId: cart.anonymousUserId || undefined,
      items,
      totalQuantity,
      totalPrice,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  private formatCartItem(item: any): CartItemDto {
    if (item.offer) {
      // This is a product offer item
      return {
        id: item.id,
        cartId: item.cartId,
        offerId: item.offerId,
        offer: {
          id: item.offer.id,
          name: item.offer.name,
          description: item.offer.description || undefined,
          price: item.offer.price.toNumber ? item.offer.price.toNumber() : Number(item.offer.price),
          oldPrice: item.offer.oldPrice ? (item.offer.oldPrice.toNumber ? item.offer.oldPrice.toNumber() : Number(item.offer.oldPrice)) : undefined,
          image: item.offer.image || undefined,
          deliveryDays: item.offer.deliveryDays || undefined,
          isOriginal: item.offer.isOriginal,
          isAnalog: item.offer.isAnalog,
          isActive: item.offer.isActive,
          expiresAt: item.offer.expiresAt || undefined,
        } as CartProductOfferDto,
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    }

    // This is a regular product item
    return {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      product: item.product ? this.formatProduct(item.product) : undefined,
      quantity: item.quantity,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private formatProduct(product: any): ProductDto {
    // Format categories if they exist
    let categories = [];
    if (product.categories && Array.isArray(product.categories)) {
      categories = product.categories.map((pc: any) => {
        if (pc.category) {
          // This is a ProductCategory relation
          return {
            id: pc.category.id,
            name: pc.category.name,
            slug: pc.category.slug,
            description: pc.category.description,
            parentId: pc.category.parentId,
            isActive: pc.category.isActive,
            sortOrder: pc.category.sortOrder,
          };
        }
        // This is already a category object
        return pc;
      });
    }

    const formatted: ProductDto = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || undefined,
      price: product.price.toNumber ? product.price.toNumber() : product.price,
      sku: product.sku,
      stock: product.stock,
      images: product.images || [],
      isActive: product.isActive,
      excludeFromPromoCodes: product.excludeFromPromoCodes || false,
      categories,
      specifications: product.specifications || undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    // Добавляем атрибуты если они есть
    if (product.attributes && product.attributes.length > 0) {
      formatted.attributes = product.attributes.map((pa: any) => {
        const attrValue: any = {
          attributeId: pa.attributeId,
          attribute: {
            id: pa.attribute.id,
            code: pa.attribute.code,
            name: pa.attribute.name,
            type: pa.attribute.type,
            unit: pa.attribute.unit,
            isRequired: pa.attribute.isRequired,
            isFilterable: pa.attribute.isFilterable,
            sortOrder: pa.attribute.sortOrder,
            options: pa.attribute.options,
            createdAt: pa.attribute.createdAt,
            updatedAt: pa.attribute.updatedAt,
          },
        };

        // Добавляем значения в зависимости от типа
        if (pa.textValue !== null) attrValue.textValue = pa.textValue;
        if (pa.numberValue !== null) attrValue.numberValue = pa.numberValue;
        if (pa.colorValue !== null) attrValue.colorValue = pa.colorValue;
        if (pa.optionIds && pa.optionIds.length > 0)
          attrValue.optionIds = pa.optionIds;

        return attrValue;
      });
    }

    return formatted;
  }

  async getCartSummary(
    userId: string | undefined,
    anonymousUserId: string | undefined,
    promoCode?: string,
  ): Promise<CartSummaryDto> {
    const cart = await this.getCart(userId, anonymousUserId);
    
    const summary: CartSummaryDto = {
      totalQuantity: cart.totalQuantity,
      totalPrice: cart.totalPrice,
      itemsCount: cart.items.length,
    };

    if (promoCode) {
      // Convert cart items to validation format
      const itemsForValidation = cart.items.map(item => ({
        productId: item.productId,
        offerId: item.offerId,
        quantity: item.quantity,
        product: item.product ? {
          price: { toNumber: () => item.product!.price } as any,
          excludeFromPromoCodes: item.product!.excludeFromPromoCodes,
        } : undefined,
        offer: item.offer ? {
          price: { toNumber: () => item.offer!.price } as any,
        } : undefined,
      }));

      const validation = await this.promoCodeValidation.validatePromoCode(
        promoCode,
        userId || null,
        itemsForValidation,
      );

      if (validation.isValid && validation.discountAmount) {
        const promoCodeData = await this.promoCodesService.findByCode(promoCode);
        
        return {
          ...summary,
          promoCode: {
            code: promoCode.toUpperCase(),
            discountAmount: validation.discountAmount,
            discountType: promoCodeData?.discountType || 'FIXED_AMOUNT',
          },
        };
      } else {
        return {
          ...summary,
          promoCode: {
            code: promoCode.toUpperCase(),
            discountAmount: 0,
            discountType: 'FIXED_AMOUNT',
            error: validation.error,
          },
        };
      }
    }

    return summary;
  }
}
