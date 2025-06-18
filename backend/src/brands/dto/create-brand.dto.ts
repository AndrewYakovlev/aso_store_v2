import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ description: 'Название бренда' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ description: 'URL-совместимый идентификатор' })
  @IsString()
  @MinLength(1)
  slug: string;

  @ApiProperty({ description: 'Описание бренда', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'URL логотипа', required: false })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({ description: 'Официальный сайт', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ description: 'Страна производителя', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Активен ли бренд', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ description: 'Порядок сортировки', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number = 0;
}
