import { ApiProperty } from '@nestjs/swagger';

export class OverallStatisticsDto {
  @ApiProperty({ description: 'Общее количество заказов' })
  totalOrders: number;

  @ApiProperty({ description: 'Общая выручка', type: String })
  totalRevenue: string;

  @ApiProperty({ description: 'Количество клиентов' })
  totalCustomers: number;

  @ApiProperty({ description: 'Количество активных товаров' })
  totalProducts: number;

  @ApiProperty({ description: 'Количество активных заказов' })
  activeOrders: number;

  @ApiProperty({ description: 'Количество заказов за сегодня' })
  todayOrders: number;

  @ApiProperty({ description: 'Выручка за сегодня', type: String })
  todayRevenue: string;
}
