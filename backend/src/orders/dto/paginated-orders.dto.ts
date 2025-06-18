import { ApiProperty } from '@nestjs/swagger';
import { OrderDto } from './order.dto';

export class PaginatedOrdersDto {
  @ApiProperty({ description: 'Массив заказов', type: [OrderDto] })
  items: OrderDto[];

  @ApiProperty({ description: 'Общее количество заказов' })
  total: number;

  @ApiProperty({ description: 'Текущая страница' })
  page: number;

  @ApiProperty({ description: 'Количество на странице' })
  limit: number;

  @ApiProperty({ description: 'Общее количество страниц' })
  totalPages: number;
}
