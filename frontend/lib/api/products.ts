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
  // Get all products with filters
  async getAll(filter: ProductsFilter = {}): Promise<PaginatedProducts> {
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

    return apiRequest<PaginatedProducts>(`/products?${params}`);
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
};