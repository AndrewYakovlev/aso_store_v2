import { ApiProperty } from '@nestjs/swagger';

export class TopProductDto {
  @ApiProperty({ description: 'ID товара' })
  productId: string;

  @ApiProperty({ description: 'Название товара' })
  productName: string;

  @ApiProperty({ description: 'Артикул товара' })
  productSku: string;

  @ApiProperty({ description: 'Бренд' })
  brand: string;

  @ApiProperty({ description: 'Категория' })
  category: string;

  @ApiProperty({ description: 'Количество заказов' })
  orderCount: number;

  @ApiProperty({ description: 'Общее количество' })
  totalQuantity: number;

  @ApiProperty({ description: 'Общая выручка', type: String })
  totalRevenue: string;
}
