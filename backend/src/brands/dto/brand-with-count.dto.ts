import { ApiProperty } from '@nestjs/swagger';
import { BrandDto } from './brand.dto';

export class BrandWithCountDto extends BrandDto {
  @ApiProperty({ description: 'Количество товаров бренда' })
  productsCount: number;
}
