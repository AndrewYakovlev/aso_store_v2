import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from '../../products/dto';

export class CartItemDto {
  @ApiProperty({ description: 'ID элемента корзины' })
  id: string;

  @ApiProperty({ description: 'ID корзины' })
  cartId: string;

  @ApiProperty({ description: 'ID товара' })
  productId: string;

  @ApiProperty({ description: 'Товар', type: ProductDto })
  product: ProductDto;

  @ApiProperty({ description: 'Количество' })
  quantity: number;

  @ApiProperty({ description: 'Дата добавления' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;
}