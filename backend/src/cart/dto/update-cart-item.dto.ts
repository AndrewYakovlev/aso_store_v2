import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'Новое количество товара', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
