import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsUrl, IsUUID, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductImageDto {
  @ApiProperty({ description: 'URL изображения' })
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Alt текст для SEO', required: false })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiProperty({ description: 'Порядок отображения', default: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number = 0;

  @ApiProperty({ description: 'Главное изображение', default: false })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean = false;
}

export class UpdateProductImageDto {
  @ApiProperty({ description: 'Alt текст для SEO', required: false })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiProperty({ description: 'Порядок отображения', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;

  @ApiProperty({ description: 'Главное изображение', required: false })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}

export class ProductImageDto {
  @ApiProperty({ description: 'ID изображения' })
  id: string;

  @ApiProperty({ description: 'ID товара' })
  productId: string;

  @ApiProperty({ description: 'URL изображения' })
  url: string;

  @ApiProperty({ description: 'Alt текст для SEO', required: false, nullable: true })
  alt?: string | null;

  @ApiProperty({ description: 'Порядок отображения' })
  sortOrder: number;

  @ApiProperty({ description: 'Главное изображение' })
  isMain: boolean;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;
}

export class ReorderProductImagesDto {
  @ApiProperty({ 
    description: 'Массив ID изображений в нужном порядке',
    type: [String]
  })
  @IsArray()
  @IsUUID('4', { each: true })
  imageIds: string[];
}