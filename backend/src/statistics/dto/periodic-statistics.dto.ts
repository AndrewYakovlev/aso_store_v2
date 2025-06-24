import { ApiProperty } from '@nestjs/swagger';

export class PeriodicStatisticsItemDto {
  @ApiProperty({ description: 'Название периода' })
  period: string;

  @ApiProperty({ description: 'Количество заказов' })
  orders: number;

  @ApiProperty({ description: 'Выручка за период', type: String })
  revenue: string;
}

export class PeriodicStatisticsDto {
  @ApiProperty({ type: [PeriodicStatisticsItemDto] })
  statistics: PeriodicStatisticsItemDto[];
}