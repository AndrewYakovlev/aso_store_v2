import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CategoryAttributeDto {
  @ApiProperty({ description: 'ID категории' })
  categoryId: string;

  @ApiProperty({ description: 'ID атрибута' })
  attributeId: string;

  @ApiProperty({ description: 'Атрибут' })
  attribute: any; // Will be populated with AttributeDto

  @ApiProperty({ description: 'Обязательный для категории' })
  isRequired: boolean;

  @ApiProperty({ description: 'Порядок сортировки' })
  sortOrder: number;
}

export class AssignAttributesToCategoryDto {
  @ApiProperty({
    description: 'Список атрибутов для привязки к категории',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  attributeIds: string[];

  @ApiProperty({
    description: 'Сделать атрибуты обязательными',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}
