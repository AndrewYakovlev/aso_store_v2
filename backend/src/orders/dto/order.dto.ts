import { ApiProperty } from '@nestjs/swagger';
import { OrderOrderStatusDto } from './order-status.dto';
import { OrderDeliveryMethodDto } from './delivery-method.dto';
import { OrderPaymentMethodDto } from './payment-method.dto';
import { OrderItemDto } from './order-item.dto';

export class OrderDto {
  @ApiProperty({ description: 'ID заказа' })
  id: string;

  @ApiProperty({ description: 'Номер заказа' })
  orderNumber: string;

  @ApiProperty({ description: 'ID пользователя', required: false })
  userId?: string;

  @ApiProperty({ description: 'ID анонимного пользователя', required: false })
  anonymousUserId?: string;

  @ApiProperty({ description: 'Статус заказа', type: OrderOrderStatusDto })
  status: OrderOrderStatusDto;

  @ApiProperty({ description: 'Метод доставки', type: OrderDeliveryMethodDto })
  deliveryMethod: OrderDeliveryMethodDto;

  @ApiProperty({ description: 'Метод оплаты', type: OrderPaymentMethodDto })
  paymentMethod: OrderPaymentMethodDto;

  @ApiProperty({ description: 'Стоимость товаров до скидки', required: false })
  subtotalAmount?: number;

  @ApiProperty({ description: 'Сумма скидки', required: false })
  discountAmount?: number;

  @ApiProperty({ description: 'Общая стоимость товаров' })
  totalAmount: number;

  @ApiProperty({ description: 'Стоимость доставки' })
  deliveryAmount: number;

  @ApiProperty({ description: 'Итоговая стоимость заказа' })
  grandTotal: number;

  @ApiProperty({ description: 'Имя покупателя' })
  customerName: string;

  @ApiProperty({ description: 'Телефон покупателя' })
  customerPhone: string;

  @ApiProperty({ description: 'Email покупателя', required: false })
  customerEmail?: string;

  @ApiProperty({ description: 'Полный адрес доставки', required: false })
  deliveryAddress?: string;

  @ApiProperty({ description: 'Город доставки', required: false })
  deliveryCity?: string;

  @ApiProperty({ description: 'Улица доставки', required: false })
  deliveryStreet?: string;

  @ApiProperty({ description: 'Дом доставки', required: false })
  deliveryBuilding?: string;

  @ApiProperty({ description: 'Квартира/офис доставки', required: false })
  deliveryApartment?: string;

  @ApiProperty({ description: 'Почтовый индекс', required: false })
  deliveryPostalCode?: string;

  @ApiProperty({ description: 'Комментарий к заказу', required: false })
  comment?: string;

  @ApiProperty({ description: 'Товары в заказе', type: [OrderItemDto] })
  items: OrderItemDto[];

  @ApiProperty({
    description: 'ID менеджера, создавшего заказ',
    required: false,
  })
  createdByManagerId?: string;

  @ApiProperty({
    description: 'Имя менеджера, создавшего заказ',
    required: false,
  })
  createdByManagerName?: string;

  @ApiProperty({ description: 'Заказ создан менеджером' })
  isManagerCreated: boolean;

  @ApiProperty({ description: 'Дата создания заказа' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления заказа' })
  updatedAt: Date;
}
