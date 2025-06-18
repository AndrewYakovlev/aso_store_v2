'use client';

import { apiRequest, getAnonymousToken } from './client';
import { Cart, CartSummary, CartItem, AddToCartData, UpdateCartItemData } from './cart';

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export const cartClientApi = {
  // Get current cart
  async getCart(): Promise<Cart> {
    const authToken = getAuthToken();
    const anonymousToken = getAnonymousToken();
    
    // If user is authenticated, don't send anonymous token
    return apiRequest<Cart>('/cart', {
      token: authToken || undefined,
      anonymousToken: authToken ? undefined : (anonymousToken || undefined),
    });
  },

  // Get cart summary
  async getCartSummary(): Promise<CartSummary> {
    const authToken = getAuthToken();
    const anonymousToken = getAnonymousToken();
    
    // If user is authenticated, don't send anonymous token
    return apiRequest<CartSummary>('/cart/summary', {
      token: authToken || undefined,
      anonymousToken: authToken ? undefined : (anonymousToken || undefined),
    });
  },

  // Add item to cart
  async addToCart(data: AddToCartData): Promise<CartItem> {
    const authToken = getAuthToken();
    const anonymousToken = getAnonymousToken();
    
    // If user is authenticated, don't send anonymous token
    return apiRequest<CartItem>('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
      token: authToken || undefined,
      anonymousToken: authToken ? undefined : (anonymousToken || undefined),
    });
  },

  // Update cart item quantity
  async updateCartItem(productId: string, data: UpdateCartItemData): Promise<CartItem> {
    const authToken = getAuthToken();
    const anonymousToken = getAnonymousToken();
    
    // If user is authenticated, don't send anonymous token
    return apiRequest<CartItem>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token: authToken || undefined,
      anonymousToken: authToken ? undefined : (anonymousToken || undefined),
    });
  },

  // Remove item from cart
  async removeFromCart(productId: string): Promise<void> {
    const authToken = getAuthToken();
    const anonymousToken = getAnonymousToken();
    
    // If user is authenticated, don't send anonymous token
    return apiRequest<void>(`/cart/${productId}`, {
      method: 'DELETE',
      token: authToken || undefined,
      anonymousToken: authToken ? undefined : (anonymousToken || undefined),
    });
  },

  // Clear cart
  async clearCart(): Promise<void> {
    const authToken = getAuthToken();
    const anonymousToken = getAnonymousToken();
    
    // If user is authenticated, don't send anonymous token
    return apiRequest<void>('/cart', {
      method: 'DELETE',
      token: authToken || undefined,
      anonymousToken: authToken ? undefined : (anonymousToken || undefined),
    });
  },
};