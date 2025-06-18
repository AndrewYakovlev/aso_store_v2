import { apiRequest } from './client';
import { Product } from './products';

export interface Favorite {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export const favoritesApi = {
  // Get all favorites
  async getAll(): Promise<Favorite[]> {
    return apiRequest<Favorite[]>('/favorites');
  },

  // Get favorite product IDs
  async getIds(): Promise<string[]> {
    return apiRequest<string[]>('/favorites/ids');
  },

  // Add product to favorites
  async add(productId: string): Promise<Favorite> {
    return apiRequest<Favorite>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // Remove product from favorites
  async remove(productId: string): Promise<void> {
    return apiRequest<void>(`/favorites/${productId}`, {
      method: 'DELETE',
    });
  },

  // Check if product is in favorites
  async isFavorite(productId: string): Promise<boolean> {
    return apiRequest<boolean>(`/favorites/check/${productId}`);
  },
};