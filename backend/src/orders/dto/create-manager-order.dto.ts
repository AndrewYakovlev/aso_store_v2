import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsUUID,
  IsPhoneNumber,
  IsBoolean,
} from 'class-validator';

export class CreateManagerProductOfferDto {
  @ApiProperty({ description: 'Название товара' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Описание товара' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Старая цена (до скидки)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  oldPrice?: number;

  @ApiPropertyOptional({ description: 'Срок доставки в днях' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  deliveryDays?: number;

  @ApiPropertyOptional({ description: 'Оригинальный товар' })
  @IsOptional()
  @IsBoolean()
  isOriginal?: boolean;

  @ApiPropertyOptional({ description: 'Аналог' })
  @IsOptional()
  @IsBoolean()
  isAnalog?: boolean;
}

export class CreateManagerOrderItemDto {
  @ApiProperty({ description: 'ID товара', required: false })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({ description: 'ID товарного предложения', required: false })
  @IsOptional()
  @IsUUID()
  offerId?: string;

  @ApiProperty({
    description: 'Данные для создания нового товарного предложения',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateManagerProductOfferDto)
  offerData?: CreateManagerProductOfferDto;

  @ApiProperty({ description: 'Количество' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Цена за единицу (может быть изменена менеджером)',
  })
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateManagerOrderDto {
  @ApiProperty({ description: 'Телефон клиента' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({ description: 'Имя клиента' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiPropertyOptional({ description: 'Email клиента' })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ description: 'ID метода доставки' })
  @IsUUID()
  deliveryMethodId: string;

  @ApiProperty({ description: 'ID метода оплаты' })
  @IsUUID()
  paymentMethodId: string;

  @ApiPropertyOptional({ description: 'Адрес доставки' })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional({ description: 'Город' })
  @IsOptional()
  @IsString()
  deliveryCity?: string;

  @ApiPropertyOptional({ description: 'Улица' })
  @IsOptional()
  @IsString()
  deliveryStreet?: string;

  @ApiPropertyOptional({ description: 'Дом' })
  @IsOptional()
  @IsString()
  deliveryBuilding?: string;

  @ApiPropertyOptional({ description: 'Квартира' })
  @IsOptional()
  @IsString()
  deliveryApartment?: string;

  @ApiPropertyOptional({ description: 'Почтовый индекс' })
  @IsOptional()
  @IsString()
  deliveryPostalCode?: string;

  @ApiPropertyOptional({ description: 'Комментарий к заказу' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: 'Товары в заказе',
    type: [CreateManagerOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateManagerOrderItemDto)
  items: CreateManagerOrderItemDto[];
}
