import { ApiProperty } from '@nestjs/swagger';

export class OrderPaymentMethodDto {
  @ApiProperty({ description: 'ID метода оплаты' })
  id: string;

  @ApiProperty({ description: 'Код метода оплаты' })
  code: string;

  @ApiProperty({ description: 'Название метода оплаты' })
  name: string;

  @ApiProperty({ description: 'Описание метода оплаты', required: false })
  description?: string;

  @ApiProperty({ description: 'Активен ли метод оплаты' })
  isActive: boolean;
}
