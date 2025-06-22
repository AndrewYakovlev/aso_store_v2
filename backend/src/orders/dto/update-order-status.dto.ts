import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateOrderOrderStatusDto {
  @ApiProperty({ description: 'ID нового статуса заказа' })
  @IsUUID()
  statusId: string;
}
