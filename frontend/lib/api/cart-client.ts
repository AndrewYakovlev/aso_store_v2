'use client';

import { UnifiedApiClient } from './unified-client';
import { Cart, CartSummary, CartItem, AddToCartData, UpdateCartItemData } from './cart';

export const cartClientApi = {
  // Get current cart
  async getCart(): Promise<Cart> {
    return UnifiedApiClient.get<Cart>('/cart');
  },

  // Get cart summary
  async getCartSummary(): Promise<CartSummary> {
    return UnifiedApiClient.get<CartSummary>('/cart/summary');
  },

  // Add item to cart
  async addToCart(data: AddToCartData): Promise<CartItem> {
    return UnifiedApiClient.post<CartItem>('/cart', data);
  },

  // Update cart item quantity
  async updateCartItem(productId: string, data: UpdateCartItemData): Promise<CartItem> {
    return UnifiedApiClient.put<CartItem>(`/cart/${productId}`, data);
  },

  // Remove item from cart
  async removeFromCart(productId: string): Promise<void> {
    return UnifiedApiClient.delete<void>(`/cart/${productId}`);
  },

  // Clear cart
  async clearCart(): Promise<void> {
    return UnifiedApiClient.delete<void>('/cart');
  },
};