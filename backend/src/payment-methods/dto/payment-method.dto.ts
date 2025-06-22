import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDto {
  @ApiProperty({ description: 'ID метода оплаты' })
  id: string;

  @ApiProperty({ description: 'Название метода оплаты' })
  name: string;

  @ApiProperty({ description: 'Описание метода' })
  description: string;

  @ApiProperty({ description: 'Активен ли метод' })
  isActive: boolean;

  @ApiProperty({ description: 'Порядок сортировки' })
  sortOrder: number;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;
}
