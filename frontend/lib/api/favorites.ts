import { apiRequest, getAnonymousToken } from './client';
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
    const anonymousToken = getAnonymousToken();
    return apiRequest<Favorite[]>('/favorites', {
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Get favorite product IDs
  async getIds(): Promise<string[]> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<string[]>('/favorites/ids', {
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Add product to favorites
  async add(productId: string): Promise<Favorite> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<Favorite>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ productId }),
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Remove product from favorites
  async remove(productId: string): Promise<void> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<void>(`/favorites/${productId}`, {
      method: 'DELETE',
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Check if product is in favorites
  async isFavorite(productId: string): Promise<boolean> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<boolean>(`/favorites/check/${productId}`, {
      anonymousToken: anonymousToken || undefined,
    });
  },
};