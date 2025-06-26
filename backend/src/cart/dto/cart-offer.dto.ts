import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartProductOfferDto {
  @ApiProperty({ description: 'ID товарного предложения' })
  id: string;

  @ApiProperty({ description: 'Название товара' })
  name: string;

  @ApiPropertyOptional({ description: 'Описание товара' })
  description?: string;

  @ApiProperty({ description: 'Цена', type: Number })
  price: number;

  @ApiPropertyOptional({ description: 'Старая цена', type: Number })
  oldPrice?: number;

  @ApiPropertyOptional({ description: 'Изображение товара' })
  image?: string;

  @ApiPropertyOptional({ description: 'Дни доставки' })
  deliveryDays?: number;

  @ApiPropertyOptional({ description: 'Оригинальная запчасть' })
  isOriginal?: boolean;

  @ApiPropertyOptional({ description: 'Аналог' })
  isAnalog?: boolean;

  @ApiProperty({ description: 'Активное предложение' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Срок действия предложения' })
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Имя менеджера' })
  managerName?: string;
}
