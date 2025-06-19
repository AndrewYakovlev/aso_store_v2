import { apiRequest } from './client';

// Types
export interface ImportOptions {
  updateExisting?: boolean;
  createNew?: boolean;
  autoMatchCategories?: boolean;
  autoMatchBrands?: boolean;
  confidenceThreshold?: number;
  defaultCategoryId?: string;
  defaultBrandId?: string;
  updatePrices?: boolean;
  updateStock?: boolean;
  skipErrors?: boolean;
}

export interface ImportResult {
  totalRecords: number;
  createdProducts: number;
  updatedProducts: number;
  skippedRecords: number;
  errors: number;
  details: ImportDetail[];
  errorMessages: string[];
}

export interface ImportDetail {
  row: number;
  sku: string;
  name: string;
  status: 'created' | 'updated' | 'skipped' | 'error';
  message: string;
  matchedCategory?: string;
  matchedBrand?: string;
}

export interface ImportPreview {
  totalRecords: number;
  preview: ImportPreviewItem[];
  categoryMatches: CategoryMatchStats[];
  brandMatches: BrandMatchStats[];
}

export interface ImportPreviewItem {
  row: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  suggestedCategory?: string;
  suggestedBrand?: string;
  categoryConfidence?: number;
  brandConfidence?: number;
}

export interface CategoryMatchStats {
  categoryName: string;
  count: number;
  percentage: number;
}

export interface BrandMatchStats {
  brandName: string;
  count: number;
  percentage: number;
}

// Imports API
export const importsApi = {
  // Preview products import
  async previewProductsImport(file: File, accessToken: string): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest('/imports/products/preview', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });
  },

  // Import products
  async importProducts(file: File, options: ImportOptions = {}, accessToken: string): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    return apiRequest('/imports/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });
  },
};