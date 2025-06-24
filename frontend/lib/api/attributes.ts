import { apiRequest } from './client';

// Types
export enum AttributeType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  COLOR = 'COLOR',
  SELECT_ONE = 'SELECT_ONE',
  SELECT_MANY = 'SELECT_MANY',
}

export interface AttributeOption {
  id: string;
  attributeId: string;
  value: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attribute {
  id: string;
  code: string;
  name: string;
  type: AttributeType;
  unit?: string;
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
  options: AttributeOption[];
  categoryAttributes?: CategoryAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttributeOptionDto {
  value: string;
  sortOrder?: number;
}

export interface CreateAttributeDto {
  code: string;
  name: string;
  type: AttributeType;
  unit?: string;
  isRequired?: boolean;
  isFilterable?: boolean;
  sortOrder?: number;
  options?: CreateAttributeOptionDto[]; // For SELECT types
}

export interface UpdateAttributeDto {
  name?: string;
  type?: AttributeType;
  unit?: string;
  isRequired?: boolean;
  isFilterable?: boolean;
  sortOrder?: number;
  options?: CreateAttributeOptionDto[]; // For SELECT types
}

export interface AttributesFilter {
  search?: string;
  type?: AttributeType;
  isRequired?: boolean;
  isFilterable?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryAttribute {
  categoryId: string;
  attributeId: string;
  isRequired: boolean;
  sortOrder: number;
  attribute?: Attribute; // Optional to avoid circular reference
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AssignAttributesToCategoryDto {
  attributeIds: string[];
  isRequired?: boolean;
}

export interface ProductAttributeValue {
  id: string;
  productId: string;
  attributeId: string;
  textValue?: string;
  numberValue?: number;
  colorValue?: string;
  optionIds: string[];
  attribute: Attribute;
  createdAt: string;
  updatedAt: string;
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

// Attributes API

export const attributesApi = {
  // Get all attributes
  async getAll(filter: AttributesFilter = {}): Promise<Attribute[]> {
    const params = new URLSearchParams();
    
    if (filter.search) params.append('search', filter.search);
    if (filter.type) params.append('type', filter.type);
    if (filter.isRequired !== undefined) params.append('isRequired', String(filter.isRequired));
    if (filter.isFilterable !== undefined) params.append('isFilterable', String(filter.isFilterable));
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
    
    const queryString = params.toString();
    return apiRequest(`/attributes${queryString ? `?${queryString}` : ''}`);
  },

  // Get attribute by ID
  async getById(id: string): Promise<Attribute> {
    return apiRequest(`/attributes/${id}`);
  },

  // Get attribute by code
  async getByCode(code: string): Promise<Attribute> {
    return apiRequest(`/attributes/code/${code}`);
  },

  // Create attribute (Admin only)
  async create(data: CreateAttributeDto, accessToken: string): Promise<Attribute> {
    return apiRequest('/attributes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Update attribute (Admin only)
  async update(id: string, data: UpdateAttributeDto, accessToken: string): Promise<Attribute> {
    return apiRequest(`/attributes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Delete attribute (Admin only)
  async delete(id: string, accessToken: string): Promise<void> {
    return apiRequest(`/attributes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },

  // Get category attributes
  async getCategoryAttributes(categoryId: string): Promise<CategoryAttribute[]> {
    return apiRequest(`/attributes/category/${categoryId}`);
  },

  // Assign attributes to category (Admin only)
  async assignToCategory(categoryId: string, data: AssignAttributesToCategoryDto, accessToken: string): Promise<CategoryAttribute[]> {
    return apiRequest(`/attributes/category/${categoryId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Remove attribute from category (Admin only)
  async removeFromCategory(categoryId: string, attributeId: string, accessToken: string): Promise<void> {
    return apiRequest(`/attributes/category/${categoryId}/${attributeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },

  // Get attributes for multiple categories
  async getAttributesByCategoryIds(categoryIds: string[]): Promise<CategoryAttribute[]> {
    if (categoryIds.length === 0) return [];
    
    // Make requests for each category and combine results
    const promises = categoryIds.map(id => this.getCategoryAttributes(id));
    const results = await Promise.all(promises);
    
    // Flatten and deduplicate by attributeId
    const attributesMap = new Map<string, CategoryAttribute>();
    results.flat().forEach(attr => {
      // Keep the one with highest priority (isRequired = true wins)
      const existing = attributesMap.get(attr.attributeId);
      if (!existing || attr.isRequired) {
        attributesMap.set(attr.attributeId, attr);
      }
    });
    
    return Array.from(attributesMap.values())
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  // Get product attributes
  async getProductAttributes(productId: string): Promise<ProductAttributeValue[]> {
    return apiRequest(`/attributes/product/${productId}`);
  },

  // Set single product attribute (Admin/Manager)
  async setProductAttribute(productId: string, data: SetProductAttributeDto, accessToken: string): Promise<ProductAttributeValue> {
    return apiRequest(`/attributes/product/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Set multiple product attributes (Admin/Manager)
  async setProductAttributes(productId: string, data: BulkSetProductAttributesDto, accessToken: string): Promise<ProductAttributeValue[]> {
    return apiRequest(`/attributes/product/${productId}/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Remove product attribute (Admin/Manager)
  async removeProductAttribute(productId: string, attributeId: string, accessToken: string): Promise<void> {
    return apiRequest(`/attributes/product/${productId}/${attributeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },
};