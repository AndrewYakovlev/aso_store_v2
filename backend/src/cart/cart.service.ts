import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { AddToCartDto, UpdateCartItemDto, CartDto, CartItemDto, CartSummaryDto } from './dto';
import { ProductDto } from '../products/dto';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
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

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: addToCartDto.productId,
      },
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + addToCartDto.quantity;
      
      if (product.stock < newQuantity) {
        throw new BadRequestException('Insufficient stock');
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
        },
      });
    } else {
      // Create new cart item
      cartItem = await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: addToCartDto.productId,
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

  async clearCart(
    userId: string | undefined,
    anonymousUserId: string | undefined,
  ): Promise<void> {
    const cart = await this.getOrCreateCart(userId, anonymousUserId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  async getCartSummary(
    userId: string | undefined,
    anonymousUserId: string | undefined,
  ): Promise<CartSummaryDto> {
    const cart = await this.getCart(userId, anonymousUserId);

    return {
      totalQuantity: cart.totalQuantity,
      totalPrice: cart.totalPrice,
      itemsCount: cart.items.length,
    };
  }

  async mergeCarts(
    anonymousUserId: string,
    userId: string,
  ): Promise<void> {
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
      existingItems.map(item => [item.productId, item]),
    );

    // Merge items
    for (const item of anonymousCart.items) {
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
    const totalQuantity = items.reduce((sum: number, item: CartItemDto) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum: number, item: CartItemDto) => sum + (item.product.price * item.quantity), 0);

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
    return {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      product: this.formatProduct(item.product),
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
        if (pa.optionIds && pa.optionIds.length > 0) attrValue.optionIds = pa.optionIds;

        return attrValue;
      });
    }

    return formatted;
  }
}