import { apiRequest, getAnonymousToken } from './client';
import { Product } from './products';
import { ProductOffer } from '@/types/chat';

export interface CartItem {
  id: string;
  cartId: string;
  productId?: string;
  product?: Product;
  offerId?: string;
  offer?: ProductOffer;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId?: string;
  anonymousUserId?: string;
  items: CartItem[];
  totalPrice: number;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  totalQuantity: number;
  totalPrice: number;
  itemsCount: number;
  promoCode?: {
    code: string;
    discountAmount: number;
    discountType: string;
    error?: string;
  };
}

export interface AddToCartData {
  productId?: string;
  offerId?: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export const cartApi = {
  // Get current cart
  async getCart(): Promise<Cart> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<Cart>('/cart', {
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Get cart summary
  async getCartSummary(): Promise<CartSummary> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<CartSummary>('/cart/summary', {
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Add item to cart
  async addToCart(data: AddToCartData): Promise<CartItem> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<CartItem>('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Update cart item quantity
  async updateCartItem(productId: string, data: UpdateCartItemData): Promise<CartItem> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<CartItem>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Remove product from cart
  async removeFromCart(productId: string): Promise<void> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<void>(`/cart/product/${productId}`, {
      method: 'DELETE',
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Remove offer from cart
  async removeOfferFromCart(offerId: string): Promise<void> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<void>(`/cart/offer/${offerId}`, {
      method: 'DELETE',
      anonymousToken: anonymousToken || undefined,
    });
  },

  // Clear cart
  async clearCart(): Promise<void> {
    const anonymousToken = getAnonymousToken();
    return apiRequest<void>('/cart', {
      method: 'DELETE',
      anonymousToken: anonymousToken || undefined,
    });
  },
};