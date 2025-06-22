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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import {
  AddToCartDto,
  UpdateCartItemDto,
  CartDto,
  CartSummaryDto,
} from './dto';

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
    const user = req.user;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.cartService.getCart(userId, anonymousUserId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Получить сводку по корзине' })
  @ApiQuery({ name: 'promoCode', required: false, description: 'Промокод для применения' })
  @ApiResponse({
    status: 200,
    description: 'Сводка по корзине',
    type: CartSummaryDto,
  })
  @ApiBearerAuth()
  async getCartSummary(
    @Request() req,
    @Query('promoCode') promoCode?: string,
  ): Promise<CartSummaryDto> {
    const user = req.user;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.cartService.getCartSummary(userId, anonymousUserId, promoCode);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить товар в корзину' })
  @ApiResponse({ status: 201, description: 'Товар добавлен' })
  @ApiResponse({ status: 400, description: 'Недостаточно товара на складе' })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  @ApiBearerAuth()
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    const user = req.user;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.cartService.addToCart(userId, anonymousUserId, addToCartDto);
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
    const user = req.user;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.cartService.updateCartItem(
      userId,
      anonymousUserId,
      productId,
      updateCartItemDto,
    );
  }

  @Put('offer/:offerId')
  @ApiOperation({ summary: 'Обновить количество товарного предложения в корзине' })
  @ApiResponse({ status: 200, description: 'Количество обновлено' })
  @ApiResponse({ status: 400, description: 'Товарное предложение отменено' })
  @ApiResponse({ status: 404, description: 'Товарное предложение не найдено в корзине' })
  @ApiBearerAuth()
  async updateOfferCartItem(
    @Request() req,
    @Param('offerId') offerId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const user = req.user;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.cartService.updateOfferCartItem(
      userId,
      anonymousUserId,
      offerId,
      updateCartItemDto,
    );
  }

  @Delete('product/:productId')
  @ApiOperation({ summary: 'Удалить товар из корзины' })
  @ApiResponse({ status: 200, description: 'Товар удален' })
  @ApiResponse({ status: 404, description: 'Товар не найден в корзине' })
  @ApiBearerAuth()
  async removeFromCart(@Request() req, @Param('productId') productId: string) {
    const user = req.user;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    await this.cartService.removeFromCart(userId, anonymousUserId, productId);
    return { message: 'Item removed from cart' };
  }

  @Delete('offer/:offerId')
  @ApiOperation({ summary: 'Удалить товарное предложение из корзины' })
  @ApiResponse({ status: 200, description: 'Товарное предложение удалено' })
  @ApiResponse({ status: 404, description: 'Товарное предложение не найдено в корзине' })
  @ApiBearerAuth()
  async removeOfferFromCart(@Request() req, @Param('offerId') offerId: string) {
    const user = req.user;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    await this.cartService.removeOfferFromCart(userId, anonymousUserId, offerId);
    return { message: 'Offer removed from cart' };
  }

  @Delete()
  @ApiOperation({ summary: 'Очистить корзину' })
  @ApiResponse({ status: 200, description: 'Корзина очищена' })
  @ApiBearerAuth()
  async clearCart(@Request() req) {
    const user = req.user;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    await this.cartService.clearCart(userId, anonymousUserId);
    return { message: 'Cart cleared' };
  }
}
