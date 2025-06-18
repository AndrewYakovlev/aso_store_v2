import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'ID нового статуса заказа' })
  @IsUUID()
  statusId: string;
}
