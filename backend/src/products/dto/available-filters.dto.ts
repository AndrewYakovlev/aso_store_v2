import { ApiProperty } from '@nestjs/swagger';

export class AttributeOptionDto {
  @ApiProperty({ description: 'Option ID' })
  id: string;

  @ApiProperty({ description: 'Option value' })
  value: string;

  @ApiProperty({ description: 'Count of products with this option' })
  count: number;
}

export class NumberRangeDto {
  @ApiProperty({ description: 'Minimum value' })
  min: number;

  @ApiProperty({ description: 'Maximum value' })
  max: number;
}

export class ColorOptionDto {
  @ApiProperty({ description: 'Color value (hex)' })
  value: string;

  @ApiProperty({ description: 'Count of products with this color' })
  count: number;
}

export class AvailableAttributeFilterDto {
  @ApiProperty({ description: 'Attribute ID' })
  id: string;

  @ApiProperty({ description: 'Attribute name' })
  name: string;

  @ApiProperty({ description: 'Attribute code' })
  code: string;

  @ApiProperty({
    description: 'Attribute type',
    enum: ['TEXT', 'NUMBER', 'SELECT_ONE', 'SELECT_MANY', 'COLOR'],
  })
  type: string;

  @ApiProperty({ description: 'Unit of measurement', required: false })
  unit?: string;

  @ApiProperty({
    description: 'Available options for SELECT types',
    type: [AttributeOptionDto],
    required: false,
  })
  options?: AttributeOptionDto[];

  @ApiProperty({
    description: 'Value range for NUMBER type',
    type: NumberRangeDto,
    required: false,
  })
  range?: NumberRangeDto;

  @ApiProperty({
    description: 'Available colors for COLOR type',
    type: [ColorOptionDto],
    required: false,
  })
  colors?: ColorOptionDto[];
}

export class CategoryFilterDto {
  @ApiProperty({ description: 'Category ID' })
  id: string;

  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiProperty({ description: 'Category slug' })
  slug: string;

  @ApiProperty({ description: 'Count of products in this category' })
  count: number;
}

export class BrandFilterDto {
  @ApiProperty({ description: 'Brand ID' })
  id: string;

  @ApiProperty({ description: 'Brand name' })
  name: string;

  @ApiProperty({ description: 'Brand slug' })
  slug: string;

  @ApiProperty({ description: 'Count of products from this brand' })
  count: number;
}

export class PriceRangeDto {
  @ApiProperty({ description: 'Minimum price' })
  min: number;

  @ApiProperty({ description: 'Maximum price' })
  max: number;
}

export class AvailableFiltersDto {
  @ApiProperty({
    description: 'Available attribute filters',
    type: [AvailableAttributeFilterDto],
  })
  attributes: AvailableAttributeFilterDto[];

  @ApiProperty({
    description: 'Price range',
    type: PriceRangeDto,
  })
  priceRange: PriceRangeDto;

  @ApiProperty({
    description: 'Available categories',
    type: [CategoryFilterDto],
  })
  categories: CategoryFilterDto[];

  @ApiProperty({
    description: 'Available brands',
    type: [BrandFilterDto],
  })
  brands: BrandFilterDto[];
}
