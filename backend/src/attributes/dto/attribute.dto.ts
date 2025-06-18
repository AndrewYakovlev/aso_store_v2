import { ApiProperty } from '@nestjs/swagger';
import { AttributeType } from '@prisma/client';

export class AttributeOptionDto {
  @ApiProperty({ description: 'Уникальный идентификатор опции' })
  id: string;

  @ApiProperty({ description: 'ID атрибута' })
  attributeId: string;

  @ApiProperty({ description: 'Значение опции' })
  value: string;

  @ApiProperty({ description: 'Порядок сортировки' })
  sortOrder: number;
}

export class AttributeDto {
  @ApiProperty({ description: 'Уникальный идентификатор атрибута' })
  id: string;

  @ApiProperty({ description: 'Код атрибута', example: 'brand' })
  code: string;

  @ApiProperty({ description: 'Название атрибута', example: 'Бренд' })
  name: string;

  @ApiProperty({
    description: 'Тип атрибута',
    enum: AttributeType,
    example: AttributeType.SELECT_ONE,
  })
  type: AttributeType;

  @ApiProperty({
    description: 'Единица измерения (для числовых атрибутов)',
    example: 'мм',
    required: false,
  })
  unit?: string;

  @ApiProperty({ description: 'Обязательный атрибут' })
  isRequired: boolean;

  @ApiProperty({ description: 'Использовать в фильтрах' })
  isFilterable: boolean;

  @ApiProperty({ description: 'Порядок сортировки' })
  sortOrder: number;

  @ApiProperty({
    description: 'Возможные значения (для SELECT типов)',
    type: [AttributeOptionDto],
    required: false,
  })
  options?: AttributeOptionDto[];

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;
}
