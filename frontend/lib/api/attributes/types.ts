export enum AttributeType {
  SELECT_ONE = 'SELECT_ONE',
  SELECT_MANY = 'SELECT_MANY',
  NUMBER = 'NUMBER',
  TEXT = 'TEXT',
  COLOR = 'COLOR',
}

export interface AttributeOptionDto {
  id: string;
  attributeId: string;
  value: string;
  sortOrder: number;
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
}

export interface ProductAttributeValueDto {
  attributeId: string;
  attribute: AttributeDto;
  textValue?: string;
  numberValue?: number;
  colorValue?: string;
  optionIds?: string[];
}

export interface SetProductAttributeDto {
  attributeId: string;
  textValue?: string;
  numberValue?: number;
  colorValue?: string;
  optionIds?: string[];
}

export interface BulkSetProductAttributesDto {
  attributes: SetProductAttributeDto[];
}