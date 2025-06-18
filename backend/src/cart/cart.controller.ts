import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { AddToCartDto, UpdateCartItemDto, CartDto, CartSummaryDto } from './dto';

@ApiTags('cart')
@Controller('cart')
@UseGuards(OptionalAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Получить корзину текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Корзина', type: CartDto })
  @ApiBearerAuth()
  async getCart(@Request() req): Promise<CartDto> {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.cartService.getCart(userId, anonymousUserId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Получить сводку по корзине' })
  @ApiResponse({ status: 200, description: 'Сводка по корзине', type: CartSummaryDto })
  @ApiBearerAuth()
  async getCartSummary(@Request() req): Promise<CartSummaryDto> {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.cartService.getCartSummary(userId, anonymousUserId);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить товар в корзину' })
  @ApiResponse({ status: 201, description: 'Товар добавлен' })
  @ApiResponse({ status: 400, description: 'Недостаточно товара на складе' })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  @ApiBearerAuth()
  async addToCart(
    @Request() req,
    @Body() addToCartDto: AddToCartDto,
  ) {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.cartService.addToCart(
      userId,
      anonymousUserId,
      addToCartDto,
    );
  }

  @Put(':productId')
  @ApiOperation({ summary: 'Обновить количество товара в корзине' })
  @ApiResponse({ status: 200, description: 'Количество обновлено' })
  @ApiResponse({ status: 400, description: 'Недостаточно товара на складе' })
  @ApiResponse({ status: 404, description: 'Товар не найден в корзине' })
  @ApiBearerAuth()
  async updateCartItem(
    @Request() req,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.cartService.updateCartItem(
      userId,
      anonymousUserId,
      productId,
      updateCartItemDto,
    );
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Удалить товар из корзины' })
  @ApiResponse({ status: 200, description: 'Товар удален' })
  @ApiResponse({ status: 404, description: 'Товар не найден в корзине' })
  @ApiBearerAuth()
  async removeFromCart(
    @Request() req,
    @Param('productId') productId: string,
  ) {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    await this.cartService.removeFromCart(
      userId,
      anonymousUserId,
      productId,
    );
    return { message: 'Item removed from cart' };
  }

  @Delete()
  @ApiOperation({ summary: 'Очистить корзину' })
  @ApiResponse({ status: 200, description: 'Корзина очищена' })
  @ApiBearerAuth()
  async clearCart(@Request() req) {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    await this.cartService.clearCart(userId, anonymousUserId);
    return { message: 'Cart cleared' };
  }
}