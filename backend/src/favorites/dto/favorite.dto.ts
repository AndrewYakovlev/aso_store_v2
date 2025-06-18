import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from '../../products/dto';

export class FavoriteDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty({ type: ProductDto })
  product: ProductDto;

  @ApiProperty()
  createdAt: Date;
}
