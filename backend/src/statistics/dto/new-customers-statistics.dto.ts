import { ApiProperty } from '@nestjs/swagger';

export class NewCustomersStatisticsDto {
  @ApiProperty({ description: 'Количество новых клиентов' })
  newCustomers: number;

  @ApiProperty({ description: 'Количество клиентов с заказами' })
  customersWithOrders: number;

  @ApiProperty({ description: 'Процент конверсии', type: Number })
  conversionRate: number;
}