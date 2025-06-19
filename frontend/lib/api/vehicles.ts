import { apiRequest } from './client';

// Types
export interface VehicleBrand {
  id: string;
  externalId: string;
  name: string;
  nameCyrillic: string;
  slug: string;
  country?: string;
  logo?: string;
  popular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleBrandWithCount extends VehicleBrand {
  modelsCount: number;
}

export interface VehicleModel {
  id: string;
  externalId: string;
  brandId: string;
  name: string;
  nameCyrillic: string;
  slug: string;
  class: string;
  yearFrom: number;
  yearTo?: number;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  brand?: VehicleBrand;
}

export interface VehicleBrandsFilter {
  search?: string;
  country?: string;
  popular?: boolean;
  onlyActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VehicleModelsFilter {
  search?: string;
  brandId?: string;
  class?: string;
  yearFrom?: number;
  yearTo?: number;
  onlyActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedVehicleBrands {
  items: VehicleBrand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedVehicleModels {
  items: VehicleModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Vehicle Brands API
export const vehicleBrandsApi = {
  // Get all vehicle brands with pagination
  async getAll(filter: VehicleBrandsFilter = {}): Promise<PaginatedVehicleBrands> {
    const params = new URLSearchParams();
    
    if (filter.search) params.append('search', filter.search);
    if (filter.country) params.append('country', filter.country);
    if (filter.popular !== undefined) params.append('popular', String(filter.popular));
    if (filter.onlyActive !== undefined) params.append('onlyActive', String(filter.onlyActive));
    if (filter.page) params.append('page', String(filter.page));
    if (filter.limit) params.append('limit', String(filter.limit));
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
    
    return apiRequest(`/vehicle-brands?${params.toString()}`);
  },

  // Get popular vehicle brands
  async getPopular(limit: number = 15): Promise<VehicleBrandWithCount[]> {
    return apiRequest(`/vehicle-brands/popular?limit=${limit}`);
  },

  // Get available countries
  async getCountries(): Promise<string[]> {
    return apiRequest('/vehicle-brands/countries');
  },

  // Get vehicle brand by slug
  async getBySlug(slug: string): Promise<VehicleBrand> {
    return apiRequest(`/vehicle-brands/by-slug/${slug}`);
  },

  // Get vehicle brand by ID
  async getById(id: string): Promise<VehicleBrand> {
    return apiRequest(`/vehicle-brands/${id}`);
  },
};

// Vehicle Models API
export const vehicleModelsApi = {
  // Get all vehicle models with pagination
  async getAll(filter: VehicleModelsFilter = {}): Promise<PaginatedVehicleModels> {
    const params = new URLSearchParams();
    
    if (filter.search) params.append('search', filter.search);
    if (filter.brandId) params.append('brandId', filter.brandId);
    if (filter.class) params.append('class', filter.class);
    if (filter.yearFrom) params.append('yearFrom', String(filter.yearFrom));
    if (filter.yearTo) params.append('yearTo', String(filter.yearTo));
    if (filter.onlyActive !== undefined) params.append('onlyActive', String(filter.onlyActive));
    if (filter.page) params.append('page', String(filter.page));
    if (filter.limit) params.append('limit', String(filter.limit));
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
    
    return apiRequest(`/vehicle-models?${params.toString()}`);
  },

  // Get available classes
  async getClasses(): Promise<string[]> {
    return apiRequest('/vehicle-models/classes');
  },

  // Get models by brand slug
  async getByBrand(brandSlug: string): Promise<VehicleModel[]> {
    return apiRequest(`/vehicle-models/by-brand/${brandSlug}`);
  },

  // Get vehicle model by slug
  async getBySlug(slug: string): Promise<VehicleModel> {
    return apiRequest(`/vehicle-models/by-slug/${slug}`);
  },

  // Get vehicle model by ID
  async getById(id: string): Promise<VehicleModel> {
    return apiRequest(`/vehicle-models/${id}`);
  },
};