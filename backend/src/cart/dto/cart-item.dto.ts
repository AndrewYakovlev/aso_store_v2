import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductDto } from '../../products/dto';
import { CartProductOfferDto } from './cart-offer.dto';

export class CartItemDto {
  @ApiProperty({ description: 'ID элемента корзины' })
  id: string;

  @ApiProperty({ description: 'ID корзины' })
  cartId: string;

  @ApiPropertyOptional({ description: 'ID товара' })
  productId?: string;

  @ApiPropertyOptional({ description: 'Товар', type: ProductDto })
  product?: ProductDto;

  @ApiPropertyOptional({ description: 'ID товарного предложения' })
  offerId?: string;

  @ApiPropertyOptional({ description: 'Товарное предложение', type: CartProductOfferDto })
  offer?: CartProductOfferDto;

  @ApiProperty({ description: 'Количество' })
  quantity: number;

  @ApiProperty({ description: 'Дата добавления' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;
}
