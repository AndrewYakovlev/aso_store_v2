import { ApiProperty } from '@nestjs/swagger';

export class DeliveryMethodDto {
  @ApiProperty({ description: 'ID метода доставки' })
  id: string;

  @ApiProperty({ description: 'Название метода доставки' })
  name: string;

  @ApiProperty({ description: 'Описание метода' })
  description: string;

  @ApiProperty({ description: 'Базовая стоимость доставки' })
  price: number;

  @ApiProperty({ description: 'Активен ли метод' })
  isActive: boolean;

  @ApiProperty({ description: 'Порядок сортировки' })
  sortOrder: number;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;
}
