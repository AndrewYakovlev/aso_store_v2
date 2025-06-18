import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  IsHexColor,
  IsUUID,
} from 'class-validator';
import { AttributeDto } from './attribute.dto';

export class ProductAttributeValueDto {
  @ApiProperty({ description: 'ID атрибута' })
  attributeId: string;

  @ApiProperty({ description: 'Атрибут' })
  attribute: AttributeDto;

  @ApiProperty({ description: 'Текстовое значение', required: false })
  textValue?: string;

  @ApiProperty({ description: 'Числовое значение', required: false })
  numberValue?: number;

  @ApiProperty({ description: 'Цвет (HEX)', required: false })
  colorValue?: string;

  @ApiProperty({
    description: 'IDs выбранных опций (для SELECT_MANY)',
    required: false,
    type: [String],
  })
  optionIds?: string[];
}

export class SetProductAttributeDto {
  @ApiProperty({ description: 'ID атрибута' })
  @IsUUID()
  @IsNotEmpty()
  attributeId: string;

  @ApiProperty({ description: 'Текстовое значение', required: false })
  @IsString()
  @IsOptional()
  textValue?: string;

  @ApiProperty({ description: 'Числовое значение', required: false })
  @IsNumber()
  @IsOptional()
  numberValue?: number;

  @ApiProperty({ description: 'Цвет (HEX)', required: false })
  @IsHexColor()
  @IsOptional()
  colorValue?: string;

  @ApiProperty({
    description: 'IDs выбранных опций (для SELECT_MANY)',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  optionIds?: string[];
}

export class BulkSetProductAttributesDto {
  @ApiProperty({
    description: 'Список атрибутов и их значений',
    type: [SetProductAttributeDto],
  })
  @IsArray()
  attributes: SetProductAttributeDto[];
}
