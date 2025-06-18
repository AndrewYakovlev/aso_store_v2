import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  Min,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProductsFilterDto {
  @ApiProperty({ description: 'Поиск по названию или артикулу', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Фильтр по категориям', type: [String], required: false })
  @IsOptional()
  @Type(() => String)
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  @ApiProperty({ description: 'Фильтр по брендам', type: [String], required: false })
  @IsOptional()
  @Type(() => String)
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  @IsArray()
  @IsUUID('4', { each: true })
  brandIds?: string[];

  @ApiProperty({ description: 'Минимальная цена', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @ApiProperty({ description: 'Максимальная цена', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @ApiProperty({ description: 'Только активные товары', required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  onlyActive?: boolean;

  @ApiProperty({ description: 'Только товары в наличии', required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  inStock?: boolean;

  @ApiProperty({ description: 'Номер страницы', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: 'Количество на странице', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @ApiProperty({ description: 'Поле для сортировки', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: 'Направление сортировки (asc/desc)', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ description: 'Фильтр по модели автомобиля', required: false })
  @IsOptional()
  @IsUUID()
  vehicleModelId?: string;

  @ApiProperty({ description: 'Год автомобиля для фильтрации', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Type(() => Number)
  vehicleYear?: number;
}