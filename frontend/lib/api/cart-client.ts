'use client';

import { UnifiedApiClient } from './unified-client';
import { Cart, CartSummary, CartItem, AddToCartData, UpdateCartItemData } from './cart';

export const cartClientApi = {
  // Get current cart
  async getCart(): Promise<Cart> {
    return UnifiedApiClient.get<Cart>('/cart');
  },

  // Get cart summary
  async getCartSummary(promoCode?: string): Promise<CartSummary> {
    const params = promoCode ? `?promoCode=${encodeURIComponent(promoCode)}` : '';
    return UnifiedApiClient.get<CartSummary>(`/cart/summary${params}`);
  },

  // Add item to cart
  async addToCart(data: AddToCartData): Promise<CartItem> {
    return UnifiedApiClient.post<CartItem>('/cart', data);
  },

  // Update cart item quantity
  async updateCartItem(productId: string, data: UpdateCartItemData): Promise<CartItem> {
    return UnifiedApiClient.put<CartItem>(`/cart/${productId}`, data);
  },

  // Update offer cart item quantity
  async updateOfferCartItem(offerId: string, data: UpdateCartItemData): Promise<CartItem> {
    return UnifiedApiClient.put<CartItem>(`/cart/offer/${offerId}`, data);
  },

  // Remove product from cart
  async removeFromCart(productId: string): Promise<void> {
    return UnifiedApiClient.delete<void>(`/cart/product/${productId}`);
  },

  // Remove offer from cart
  async removeOfferFromCart(offerId: string): Promise<void> {
    return UnifiedApiClient.delete<void>(`/cart/offer/${offerId}`);
  },

  // Clear cart
  async clearCart(): Promise<void> {
    return UnifiedApiClient.delete<void>('/cart');
  },
};