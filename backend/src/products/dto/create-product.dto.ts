import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  MinLength,
  Min,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Артикул товара' })
  @IsString()
  @MinLength(1)
  sku: string;

  @ApiProperty({ description: 'Название товара' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ description: 'URL-совместимый идентификатор' })
  @IsString()
  @MinLength(1)
  slug: string;

  @ApiProperty({ description: 'Описание товара', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Цена товара' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: 'Количество на складе', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock?: number = 0;

  @ApiProperty({ description: 'Активен ли товар', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ description: 'ID бренда', required: false })
  @IsOptional()
  @IsUUID('4')
  brandId?: string;

  @ApiProperty({
    description: 'Массив ID категорий',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds: string[];

  @ApiProperty({
    description: 'Массив URL изображений',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[] = [];
}
