import { ApiProperty } from '@nestjs/swagger';

export class DeliveryMethodDto {
  @ApiProperty({ description: 'ID метода доставки' })
  id: string;

  @ApiProperty({ description: 'Код метода доставки' })
  code: string;

  @ApiProperty({ description: 'Название метода доставки' })
  name: string;

  @ApiProperty({ description: 'Описание метода доставки', required: false })
  description?: string;

  @ApiProperty({ description: 'Стоимость доставки' })
  price: number;

  @ApiProperty({ description: 'Активен ли метод доставки' })
  isActive: boolean;
}
