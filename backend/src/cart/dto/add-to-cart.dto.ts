import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'ID товара' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Количество товара', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
