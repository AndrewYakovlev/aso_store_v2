import { UnifiedApiClient } from './unified-client';
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
    return UnifiedApiClient.get<Favorite[]>('/favorites');
  },

  // Get favorite product IDs
  async getIds(): Promise<string[]> {
    return UnifiedApiClient.get<string[]>('/favorites/ids');
  },

  // Add product to favorites
  async add(productId: string): Promise<Favorite> {
    return UnifiedApiClient.post<Favorite>('/favorites', { productId });
  },

  // Remove product from favorites
  async remove(productId: string): Promise<void> {
    return UnifiedApiClient.delete<void>(`/favorites/${productId}`);
  },

  // Check if product is in favorites
  async isFavorite(productId: string): Promise<boolean> {
    return UnifiedApiClient.get<boolean>(`/favorites/check/${productId}`);
  },
};