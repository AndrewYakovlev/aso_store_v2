import { ApiProperty } from '@nestjs/swagger';

export class OrderOrderStatusDto {
  @ApiProperty({ description: 'ID статуса' })
  id: string;

  @ApiProperty({ description: 'Код статуса' })
  code: string;

  @ApiProperty({ description: 'Название статуса' })
  name: string;

  @ApiProperty({ description: 'Порядок сортировки' })
  sortOrder: number;

  @ApiProperty({ description: 'Активен ли статус' })
  isActive: boolean;
}
