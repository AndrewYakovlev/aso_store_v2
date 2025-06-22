import { ApiProperty } from '@nestjs/swagger';

export class PromoCodeInfoDto {
  @ApiProperty({ description: 'Код промокода' })
  code: string;

  @ApiProperty({ description: 'Сумма скидки' })
  discountAmount: number;

  @ApiProperty({ description: 'Тип скидки', enum: ['FIXED_AMOUNT', 'PERCENTAGE'] })
  discountType: string;

  @ApiProperty({ description: 'Ошибка валидации', required: false })
  error?: string;
}

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

  @ApiProperty({
    description: 'Информация о примененном промокоде',
    type: PromoCodeInfoDto,
    required: false,
  })
  promoCode?: PromoCodeInfoDto;
}
