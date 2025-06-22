'use client';

import { apiRequestWithAuth } from './client-with-auth';
import { Cart, CartSummary, CartItem, AddToCartData, UpdateCartItemData } from './cart';

export const cartApiWithAuth = {
  // Get current cart
  async getCart(): Promise<Cart> {
    return apiRequestWithAuth('/cart');
  },

  // Get cart summary
  async getCartSummary(promoCode?: string): Promise<CartSummary> {
    const params = promoCode ? `?promoCode=${encodeURIComponent(promoCode)}` : '';
    return apiRequestWithAuth(`/cart/summary${params}`);
  },

  // Add item to cart
  async addToCart(data: AddToCartData): Promise<CartItem> {
    return apiRequestWithAuth('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update cart item quantity
  async updateCartItem(productId: string, data: UpdateCartItemData): Promise<CartItem> {
    return apiRequestWithAuth(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update offer cart item quantity
  async updateOfferCartItem(offerId: string, data: UpdateCartItemData): Promise<CartItem> {
    return apiRequestWithAuth(`/cart/offer/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Remove product from cart
  async removeFromCart(productId: string): Promise<void> {
    return apiRequestWithAuth(`/cart/product/${productId}`, {
      method: 'DELETE',
    });
  },

  // Remove offer from cart
  async removeOfferFromCart(offerId: string): Promise<void> {
    return apiRequestWithAuth(`/cart/offer/${offerId}`, {
      method: 'DELETE',
    });
  },

  // Clear cart
  async clearCart(): Promise<void> {
    return apiRequestWithAuth('/cart', {
      method: 'DELETE',
    });
  },
};