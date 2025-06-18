'use client'

import { useState, useEffect, useCallback } from 'react';
import { cartApi, Cart, CartSummary, AddToCartData } from '@/lib/api/cart';
import { useAnonymousToken } from './useAnonymousToken';

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAnonymousToken();

  // Load cart
  const loadCart = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const [cartData, summaryData] = await Promise.all([
        cartApi.getCart(),
        cartApi.getCartSummary(),
      ]);
      setCart(cartData);
      setSummary(summaryData);
      setError(null);
    } catch (err) {
      // If cart is empty or not found, that's okay
      setCart({
        id: '',
        items: [],
        totalPrice: 0,
        totalQuantity: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setSummary({
        totalQuantity: 0,
        totalPrice: 0,
        itemsCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Add to cart
  const addToCart = useCallback(async (data: AddToCartData) => {
    if (!token) return;
    
    try {
      // Optimistic update for summary
      setSummary(prev => prev ? {
        ...prev,
        totalQuantity: prev.totalQuantity + data.quantity,
        itemsCount: prev.itemsCount + 1,
      } : null);

      await cartApi.addToCart(data);
      
      // Reload cart to get updated data
      await loadCart();
    } catch (err) {
      // Revert optimistic update
      await loadCart();
      throw err;
    }
  }, [token, loadCart]);

  // Update cart item
  const updateCartItem = useCallback(async (productId: string, quantity: number) => {
    if (!token || !cart) return;
    
    const currentItem = cart.items.find(item => item.productId === productId);
    if (!currentItem) return;

    const quantityDiff = quantity - currentItem.quantity;

    try {
      // Optimistic update
      setCart(prev => prev ? {
        ...prev,
        items: prev.items.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        ),
        totalQuantity: prev.totalQuantity + quantityDiff,
        totalPrice: prev.totalPrice + (currentItem.product.price * quantityDiff),
      } : null);

      setSummary(prev => prev ? {
        ...prev,
        totalQuantity: prev.totalQuantity + quantityDiff,
      } : null);

      await cartApi.updateCartItem(productId, { quantity });
    } catch (err) {
      // Revert optimistic update
      await loadCart();
      throw err;
    }
  }, [token, cart, loadCart]);

  // Remove from cart
  const removeFromCart = useCallback(async (productId: string) => {
    if (!token || !cart) return;
    
    const currentItem = cart.items.find(item => item.productId === productId);
    if (!currentItem) return;

    try {
      // Optimistic update
      setCart(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => item.productId !== productId),
        totalQuantity: prev.totalQuantity - currentItem.quantity,
        totalPrice: prev.totalPrice - (currentItem.product.price * currentItem.quantity),
      } : null);

      setSummary(prev => prev ? {
        ...prev,
        totalQuantity: prev.totalQuantity - currentItem.quantity,
        itemsCount: prev.itemsCount - 1,
      } : null);

      await cartApi.removeFromCart(productId);
    } catch (err) {
      // Revert optimistic update
      await loadCart();
      throw err;
    }
  }, [token, cart, loadCart]);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!token) return;
    
    try {
      // Optimistic update
      setCart(prev => prev ? {
        ...prev,
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
      } : null);

      setSummary({
        totalQuantity: 0,
        totalPrice: 0,
        itemsCount: 0,
      });

      await cartApi.clearCart();
    } catch (err) {
      // Revert optimistic update
      await loadCart();
      throw err;
    }
  }, [token, loadCart]);

  // Check if product is in cart
  const isInCart = useCallback((productId: string) => {
    return cart?.items.some(item => item.productId === productId) || false;
  }, [cart]);

  // Get cart item quantity
  const getItemQuantity = useCallback((productId: string) => {
    const item = cart?.items.find(item => item.productId === productId);
    return item?.quantity || 0;
  }, [cart]);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return {
    cart,
    summary,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQuantity,
    refetch: loadCart,
  };
}