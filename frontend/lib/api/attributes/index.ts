import { apiRequest } from '../client';
import { AttributeDto, SetProductAttributeDto, BulkSetProductAttributesDto } from './types';

export interface AttributesFilter {
  categoryId?: string;
  search?: string;
  type?: string;
  isFilterable?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedAttributes {
  items: AttributeDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const attributesApi = {
  // Get all attributes with filters
  async getAll(filter: AttributesFilter = {}): Promise<PaginatedAttributes> {
    const params = new URLSearchParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    return apiRequest<PaginatedAttributes>(`/attributes?${params}`);
  },

  // Get attribute by ID
  async getById(id: string): Promise<AttributeDto> {
    return apiRequest<AttributeDto>(`/attributes/${id}`);
  },

  // Get attribute by code
  async getByCode(code: string): Promise<AttributeDto> {
    return apiRequest<AttributeDto>(`/attributes/by-code/${code}`);
  },

  // Get attributes for category
  async getByCategoryId(categoryId: string): Promise<AttributeDto[]> {
    return apiRequest<AttributeDto[]>(`/attributes/by-category/${categoryId}`);
  },

  // Set product attributes
  async setProductAttributes(productId: string, data: BulkSetProductAttributesDto) {
    return apiRequest(`/products/${productId}/attributes`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get product attributes
  async getProductAttributes(productId: string) {
    return apiRequest(`/products/${productId}/attributes`);
  }
};

// Re-export types
export * from './types';