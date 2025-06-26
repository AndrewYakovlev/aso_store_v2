import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodStatisticsDto {
  @ApiProperty({ description: 'ID метода оплаты' })
  methodId: string;

  @ApiProperty({ description: 'Название метода оплаты' })
  methodName: string;

  @ApiProperty({ description: 'Количество заказов' })
  orderCount: number;

  @ApiProperty({ description: 'Общая выручка', type: String })
  totalRevenue: string;
}
