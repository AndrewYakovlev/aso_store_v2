import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  Min,
  IsArray,
  IsUUID,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Класс для фильтра по одному атрибуту
export class AttributeFilterDto {
  @ApiProperty({ 
    description: 'Значения для фильтрации (для SELECT_ONE/SELECT_MANY - ID опций, для NUMBER - массив из min и max, для TEXT - строка поиска)',
    oneOf: [
      { type: 'array', items: { type: 'string' }, description: 'Массив ID опций для SELECT типов' },
      { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2, description: 'Массив [min, max] для NUMBER типа' },
      { type: 'string', description: 'Строка поиска для TEXT типа' }
    ]
  })
  values: string[] | number[] | string;
}

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

  @ApiProperty({ 
    description: 'Фильтры по атрибутам (ключ - ID атрибута, значение - фильтр)', 
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/AttributeFilterDto' },
    required: false,
    example: {
      'attr-id-1': { values: ['option-id-1', 'option-id-2'] },
      'attr-id-2': { values: [10, 50] },
      'attr-id-3': { values: 'поисковый запрос' }
    }
  })
  @IsOptional()
  @IsObject()
  @Transform(({ value }) => {
    // Преобразуем строковые параметры из URL в правильный формат
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value;
  })
  attributes?: Record<string, AttributeFilterDto>;
}