import { ApiProperty } from '@nestjs/swagger';

export class OrderStatusStatisticsDto {
  @ApiProperty({ description: 'ID статуса' })
  statusId: string;

  @ApiProperty({ description: 'Название статуса' })
  statusName: string;

  @ApiProperty({ description: 'Цвет статуса' })
  statusColor: string;

  @ApiProperty({ description: 'Количество заказов' })
  orderCount: number;
}