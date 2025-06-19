import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class ImportOptionsDto {
  @ApiProperty({ 
    description: 'Обновлять существующие товары', 
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean = true;

  @ApiProperty({ 
    description: 'Создавать новые товары', 
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  createNew?: boolean = true;

  @ApiProperty({ 
    description: 'Автоматически сопоставлять категории', 
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  autoMatchCategories?: boolean = true;

  @ApiProperty({ 
    description: 'Автоматически сопоставлять бренды', 
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  autoMatchBrands?: boolean = true;

  @ApiProperty({ 
    description: 'Минимальный уровень уверенности для автоматического сопоставления (0-100)', 
    default: 70,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceThreshold?: number = 70;

  @ApiProperty({ 
    description: 'ID категории по умолчанию для несопоставленных товаров', 
    required: false 
  })
  @IsOptional()
  @IsString()
  defaultCategoryId?: string;

  @ApiProperty({ 
    description: 'ID бренда по умолчанию для несопоставленных товаров', 
    required: false 
  })
  @IsOptional()
  @IsString()
  defaultBrandId?: string;

  @ApiProperty({ 
    description: 'Обновлять цены существующих товаров', 
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  updatePrices?: boolean = true;

  @ApiProperty({ 
    description: 'Обновлять остатки существующих товаров', 
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  updateStock?: boolean = true;

  @ApiProperty({ 
    description: 'Пропускать записи с ошибками и продолжать импорт', 
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  skipErrors?: boolean = true;
}