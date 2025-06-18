import { ApiProperty } from '@nestjs/swagger';

export class CartSummaryDto {
  @ApiProperty({
    description: 'Общее количество товаров в корзине',
  })
  totalQuantity: number;

  @ApiProperty({
    description: 'Общая стоимость корзины',
  })
  totalPrice: number;

  @ApiProperty({
    description: 'Количество уникальных товаров',
  })
  itemsCount: number;
}
