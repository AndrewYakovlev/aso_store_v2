export type AttributeType = 'SELECT_ONE' | 'SELECT_MANY' | 'NUMBER' | 'TEXT' | 'COLOR';

export interface AttributeOptionDto {
  id: string;
  attributeId: string;
  value: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeDto {
  id: string;
  code: string;
  name: string;
  type: AttributeType;
  unit?: string;
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
  options?: AttributeOptionDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributeValueDto {
  attributeId: string;
  attribute: AttributeDto;
  textValue?: string;
  numberValue?: number;
  colorValue?: string;
  optionIds?: string[];
}