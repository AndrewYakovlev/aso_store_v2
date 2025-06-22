import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, IsOptional, ValidateIf } from 'class-validator';

export class AddToCartDto {
  @ApiPropertyOptional({ description: 'ID товара' })
  @ValidateIf((o) => !o.offerId)
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: 'ID товарного предложения' })
  @ValidateIf((o) => !o.productId)
  @IsUUID()
  offerId?: string;

  @ApiProperty({ description: 'Количество товара', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
