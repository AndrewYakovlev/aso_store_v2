import { ApiProperty } from '@nestjs/swagger';
import { CategoryDto } from '../../categories/dto';
import { ProductAttributeValueDto } from '../../attributes/dto';
import { BrandDto } from '../../brands/dto';
import { ProductVehicleDto } from '../../product-vehicles/dto';
import { ProductImageDto } from './product-image.dto';

export class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ required: false })
  oldPrice?: number;

  @ApiProperty()
  stock: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ default: false })
  excludeFromPromoCodes: boolean;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ type: [ProductImageDto], required: false })
  productImages?: ProductImageDto[];

  @ApiProperty({ required: false })
  brandId?: string;

  @ApiProperty({ type: BrandDto, required: false })
  brand?: BrandDto;

  @ApiProperty({ type: [CategoryDto] })
  categories: CategoryDto[];

  @ApiProperty({ type: [Object], required: false })
  specifications?: any[];

  @ApiProperty({ type: [ProductAttributeValueDto], required: false })
  attributes?: ProductAttributeValueDto[];

  @ApiProperty({ type: [ProductVehicleDto], required: false })
  vehicles?: ProductVehicleDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
