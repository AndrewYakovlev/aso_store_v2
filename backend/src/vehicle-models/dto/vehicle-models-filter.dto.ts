import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VehicleModelsFilterDto {
  @ApiProperty({ description: 'Поиск по названию', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Фильтр по марке', required: false })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiProperty({ description: 'Фильтр по классу автомобиля', required: false })
  @IsOptional()
  @IsString()
  class?: string;

  @ApiProperty({ description: 'Минимальный год производства', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Type(() => Number)
  yearFrom?: number;

  @ApiProperty({ description: 'Максимальный год производства', required: false })
  @IsOptional()
  @IsNumber()
  @Max(new Date().getFullYear() + 1)
  @Type(() => Number)
  yearTo?: number;

  @ApiProperty({ description: 'Только активные модели', required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  onlyActive?: boolean;

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
  sortBy?: string = 'sortOrder';

  @ApiProperty({ description: 'Направление сортировки (asc/desc)', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}