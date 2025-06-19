import { apiRequest } from './client';
import { ProductAttributeValueDto } from '@/lib/api/attributes/types';
import { BrandDto } from '@/lib/api/brands/types';
import { VehicleModel } from '@/lib/api/vehicles';

export interface ProductVehicle {
  id: string;
  productId: string;
  vehicleModelId: string;
  yearFrom?: number;
  yearTo?: number;
  fitmentNotes?: string;
  isUniversal: boolean;
  createdAt: string;
  updatedAt: string;
  vehicleModel?: VehicleModel;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  isActive: boolean;
  images: string[];
  brandId?: string;
  brand?: BrandDto;
  categories: Category[];
  attributes?: ProductAttributeValueDto[];
  vehicles?: ProductVehicle[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AttributeFilter {
  values: string[] | number[] | string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  isActive?: boolean;
  images?: string[];
  brandId?: string;
  categoryIds?: string[];
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
  images?: string[];
  brandId?: string;
  categoryIds?: string[];
}

export interface ProductsFilter {
  search?: string;
  categoryIds?: string[];
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  onlyActive?: boolean;
  inStock?: boolean;
  vehicleModelId?: string;
  vehicleYear?: number;
  attributes?: Record<string, AttributeFilter>;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productsApi = {
  // Delete product
  async delete(id: string): Promise<void> {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
  // Get all products with filters
  async getAll(filter: ProductsFilter = {}): Promise<PaginatedProducts> {
    const params = new URLSearchParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'attributes' && typeof value === 'object') {
          // Для атрибутов передаем как JSON строку
          params.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });

    return apiRequest<PaginatedProducts>(`/products?${params}`);
  },

  // Get available filters
  async getFilters(baseFilter: ProductsFilter = {}) {
    const params = new URLSearchParams();
    
    Object.entries(baseFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'attributes' && typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });

    return apiRequest(`/products/filters?${params}`);
  },

  // Get product by slug
  async getBySlug(slug: string): Promise<Product> {
    return apiRequest<Product>(`/products/by-slug/${slug}`);
  },

  // Get product by ID
  async getById(id: string): Promise<Product> {
    return apiRequest<Product>(`/products/${id}`);
  },

  // Get products by category slug
  async getByCategorySlug(categorySlug: string, filter: ProductsFilter = {}): Promise<PaginatedProducts> {
    const params = new URLSearchParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });

    return apiRequest<PaginatedProducts>(`/products/by-category/${categorySlug}?${params}`);
  },

  // Search products
  async search(query: string, filter: Omit<ProductsFilter, 'search'> = {}): Promise<PaginatedProducts> {
    return this.getAll({ ...filter, search: query });
  },

  // Create product (requires auth)
  async create(data: CreateProductDto, accessToken: string): Promise<Product> {
    return apiRequest<Product>('/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Update product (requires auth)
  async update(id: string, data: UpdateProductDto, accessToken: string): Promise<Product> {
    return apiRequest<Product>(`/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Delete product (requires auth)
  async deleteWithAuth(id: string, accessToken: string): Promise<void> {
    return apiRequest<void>(`/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },
};