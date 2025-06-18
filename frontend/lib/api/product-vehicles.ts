import { apiRequestWithAuth } from './client-with-auth';
import { ProductVehicle } from './products';

export interface CreateProductVehicle {
  vehicleModelId: string;
  yearFrom?: number;
  yearTo?: number;
  fitmentNotes?: string;
  isUniversal?: boolean;
}

export interface BulkCreateProductVehicles {
  vehicles: CreateProductVehicle[];
}

export const productVehiclesApi = {
  // Get all vehicles for a product
  async getByProduct(productId: string): Promise<ProductVehicle[]> {
    return apiRequestWithAuth(`/products/${productId}/vehicles`);
  },

  // Add a single vehicle to a product
  async create(productId: string, data: CreateProductVehicle): Promise<ProductVehicle> {
    return apiRequestWithAuth(`/products/${productId}/vehicles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Bulk update vehicles for a product
  async bulkCreate(productId: string, data: BulkCreateProductVehicles): Promise<ProductVehicle[]> {
    return apiRequestWithAuth(`/products/${productId}/vehicles/bulk`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update a vehicle connection
  async update(
    productId: string, 
    vehicleId: string, 
    data: Partial<CreateProductVehicle>
  ): Promise<ProductVehicle> {
    return apiRequestWithAuth(`/products/${productId}/vehicles/${vehicleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Remove a vehicle connection
  async remove(productId: string, vehicleId: string): Promise<void> {
    return apiRequestWithAuth(`/products/${productId}/vehicles/${vehicleId}`, {
      method: 'DELETE',
    });
  },
};