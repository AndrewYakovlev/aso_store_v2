import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Моторные масла',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'motornye-masla',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Широкий выбор моторных масел для всех типов двигателей',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Parent category ID',
    example: 'uuid-parent-category',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({
    description: 'Is category active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    description: 'Sort order',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number = 0;
}