'use client'

import React, { createContext, useContext } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { Cart, CartSummary, AddToCartData } from '@/lib/api/cart';

interface CartContextType {
  cart: Cart | null;
  summary: CartSummary | null;
  loading: boolean;
  error: string | null;
  addToCart: (data: AddToCartData) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  refetch: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}