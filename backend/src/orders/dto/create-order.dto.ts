import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsUUID,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID метода доставки' })
  @IsUUID()
  deliveryMethodId: string;

  @ApiProperty({ description: 'ID метода оплаты' })
  @IsUUID()
  paymentMethodId: string;

  @ApiProperty({ description: 'Имя покупателя' })
  @IsString()
  customerName: string;

  @ApiProperty({ description: 'Телефон покупателя' })
  @IsPhoneNumber('RU')
  customerPhone: string;

  @ApiProperty({ description: 'Email покупателя', required: false })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ description: 'Полный адрес доставки', required: false })
  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @ApiProperty({ description: 'Город доставки', required: false })
  @IsString()
  @IsOptional()
  deliveryCity?: string;

  @ApiProperty({ description: 'Улица доставки', required: false })
  @IsString()
  @IsOptional()
  deliveryStreet?: string;

  @ApiProperty({ description: 'Дом доставки', required: false })
  @IsString()
  @IsOptional()
  deliveryBuilding?: string;

  @ApiProperty({ description: 'Квартира/офис доставки', required: false })
  @IsString()
  @IsOptional()
  deliveryApartment?: string;

  @ApiProperty({ description: 'Почтовый индекс', required: false })
  @IsString()
  @IsOptional()
  deliveryPostalCode?: string;

  @ApiProperty({ description: 'Комментарий к заказу', required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ description: 'Промокод', required: false })
  @IsString()
  @IsOptional()
  promoCode?: string;
}
