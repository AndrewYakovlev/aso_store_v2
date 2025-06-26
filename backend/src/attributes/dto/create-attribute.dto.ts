import { ApiProperty } from '@nestjs/swagger';
import { AttributeType } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAttributeOptionDto {
  @ApiProperty({ description: 'Значение опции' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ description: 'Порядок сортировки', default: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class CreateAttributeDto {
  @ApiProperty({ description: 'Код атрибута', example: 'brand' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Название атрибута', example: 'Бренд' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Тип атрибута',
    enum: AttributeType,
    example: AttributeType.SELECT_ONE,
  })
  @IsEnum(AttributeType)
  type: AttributeType;

  @ApiProperty({
    description: 'Единица измерения (для числовых атрибутов)',
    example: 'мм',
    required: false,
  })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ description: 'Обязательный атрибут', default: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({ description: 'Использовать в фильтрах', default: false })
  @IsBoolean()
  @IsOptional()
  isFilterable?: boolean;

  @ApiProperty({ description: 'Порядок сортировки', default: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({
    description: 'Возможные значения (для SELECT типов)',
    type: [CreateAttributeOptionDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeOptionDto)
  @IsOptional()
  options?: CreateAttributeOptionDto[];
}
