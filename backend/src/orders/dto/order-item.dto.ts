import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from '../../products/dto';
import { ProductOfferDto } from '../../chats/dto/chat.dto';

export class OrderItemDto {
  @ApiProperty({ description: 'ID элемента заказа' })
  id: string;

  @ApiProperty({ description: 'ID заказа' })
  orderId: string;

  @ApiProperty({ description: 'ID товара', required: false })
  productId?: string;

  @ApiProperty({ description: 'ID предложения', required: false })
  offerId?: string;

  @ApiProperty({ description: 'Товар', type: ProductDto, required: false })
  product?: ProductDto;

  @ApiProperty({
    description: 'Товарное предложение',
    type: ProductOfferDto,
    required: false,
  })
  offer?: ProductOfferDto;

  @ApiProperty({ description: 'Количество' })
  quantity: number;

  @ApiProperty({ description: 'Цена за единицу' })
  price: number;

  @ApiProperty({ description: 'Общая стоимость' })
  totalPrice: number;
}
