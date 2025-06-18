import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VehicleBrandsFilterDto {
  @ApiProperty({ description: 'Поиск по названию', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Только популярные марки', required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  popular?: boolean;

  @ApiProperty({ description: 'Только активные марки', required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  onlyActive?: boolean;

  @ApiProperty({ description: 'Фильтр по стране', required: false })
  @IsOptional()
  @IsString()
  country?: string;

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