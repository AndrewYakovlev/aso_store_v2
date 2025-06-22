import { ApiProperty } from '@nestjs/swagger';

export class OrderStatusDto {
  @ApiProperty({ description: 'ID статуса' })
  id: string;

  @ApiProperty({ description: 'Код статуса' })
  code: string;

  @ApiProperty({ description: 'Название статуса' })
  name: string;

  @ApiProperty({ description: 'Цвет статуса в HEX формате' })
  color: string;

  @ApiProperty({ description: 'Описание статуса' })
  description: string;

  @ApiProperty({ description: 'Активен ли статус' })
  isActive: boolean;

  @ApiProperty({ description: 'Является ли финальным статусом' })
  isFinal: boolean;

  @ApiProperty({ description: 'Порядок сортировки' })
  sortOrder: number;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;
}
