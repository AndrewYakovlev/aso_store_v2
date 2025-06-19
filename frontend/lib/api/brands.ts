import { apiRequest } from './client';
import { BrandDto } from '@/lib/api/brands/types';
import { PaginatedProducts } from './products';

export interface BrandWithProductsCount extends BrandDto {
  productsCount?: number;
}

export interface PaginatedBrands {
  items: BrandWithProductsCount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BrandsFilter {
  search?: string;
  onlyActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const brandsApi = {
  // Get all brands with filters
  async getAll(filter?: BrandsFilter): Promise<PaginatedBrands> {
    const params = new URLSearchParams();
    
    if (filter?.search) params.append('search', filter.search);
    if (filter?.onlyActive !== undefined) params.append('onlyActive', String(filter.onlyActive));
    if (filter?.page) params.append('page', String(filter.page));
    if (filter?.limit) params.append('limit', String(filter.limit));
    if (filter?.sortBy) params.append('sortBy', filter.sortBy);
    if (filter?.sortOrder) params.append('sortOrder', filter.sortOrder);

    return apiRequest(`/brands?${params.toString()}`);
  },

  // Get brand by slug
  async getBySlug(slug: string): Promise<BrandDto> {
    return apiRequest(`/brands/by-slug/${slug}`);
  },

  // Get brand by ID
  async getById(id: string): Promise<BrandDto> {
    return apiRequest(`/brands/${id}`);
  },

  // Get products by brand
  async getProducts(brandId: string, page: number = 1, limit: number = 20): Promise<PaginatedProducts> {
    const params = new URLSearchParams({
      brandIds: brandId,
      page: String(page),
      limit: String(limit),
      onlyActive: 'true',
      inStock: 'true',
    });

    return apiRequest(`/products?${params.toString()}`);
  },

  // Create new brand (requires auth)
  async create(data: Omit<BrandDto, 'id' | 'createdAt' | 'updatedAt'>, accessToken: string): Promise<BrandDto> {
    return apiRequest('/brands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Update brand (requires auth)
  async update(id: string, data: Partial<Omit<BrandDto, 'id' | 'createdAt' | 'updatedAt'>>, accessToken: string): Promise<BrandDto> {
    return apiRequest(`/brands/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Delete brand (requires auth)
  async delete(id: string, accessToken: string): Promise<void> {
    return apiRequest(`/brands/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },
};