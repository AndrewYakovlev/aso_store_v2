import { ApiProperty } from '@nestjs/swagger';
import { CartItemDto } from './cart-item.dto';

export class CartDto {
  @ApiProperty({ description: 'ID корзины' })
  id: string;

  @ApiProperty({ 
    description: 'ID пользователя', 
    required: false 
  })
  userId?: string;

  @ApiProperty({ 
    description: 'ID анонимного пользователя', 
    required: false 
  })
  anonymousUserId?: string;

  @ApiProperty({ 
    description: 'Элементы корзины', 
    type: [CartItemDto] 
  })
  items: CartItemDto[];

  @ApiProperty({ 
    description: 'Общая стоимость корзины' 
  })
  totalPrice: number;

  @ApiProperty({ 
    description: 'Общее количество товаров' 
  })
  totalQuantity: number;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;
}