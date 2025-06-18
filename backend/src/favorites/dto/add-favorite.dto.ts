import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddFavoriteDto {
  @ApiProperty({ description: 'ID товара' })
  @IsUUID()
  productId: string;
}
