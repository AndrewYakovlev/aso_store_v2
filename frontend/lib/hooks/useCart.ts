'use client'

import { useState, useEffect, useCallback } from 'react';
import { Cart, CartSummary, AddToCartData } from '@/lib/api/cart';
import { cartClientApi } from '@/lib/api/cart-client';
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
        cartClientApi.getCart(),
        cartClientApi.getCartSummary(),
      ]);
      setCart(cartData);
      setSummary(summaryData);
      setError(null);
    } catch (err: any) {
      // If cart is empty or not found (404), that's okay
      const emptyCart = {
        id: '',
        items: [],
        totalPrice: 0,
        totalQuantity: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const emptySummary = {
        totalQuantity: 0,
        totalPrice: 0,
        itemsCount: 0,
      };
      
      setCart(emptyCart);
      setSummary(emptySummary);
      
      // Only set error if it's not a 404 (cart not found)
      if (err?.status !== 404) {
        setError(err?.message || 'Failed to load cart');
      } else {
        setError(null);
      }
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

      await cartClientApi.addToCart(data);
      
      // Reload cart to get updated data
      await loadCart();
    } catch (err) {
      // Revert optimistic update
      await loadCart();
      throw err;
    }
  }, [token, loadCart]);

  // Update cart item
  const updateCartItem = useCallback(async (productId: string | undefined, quantity: number, offerId?: string) => {
    if (!token || !cart) return;
    
    const currentItem = cart.items.find(item => 
      productId ? item.productId === productId : item.offerId === offerId
    );
    if (!currentItem) return;

    const itemPrice = currentItem.product?.price || currentItem.offer?.price || 0;
    const quantityDiff = quantity - currentItem.quantity;

    try {
      // Optimistic update
      setCart(prev => prev ? {
        ...prev,
        items: prev.items.map(item =>
          (productId && item.productId === productId) || (offerId && item.offerId === offerId)
            ? { ...item, quantity }
            : item
        ),
        totalQuantity: prev.totalQuantity + quantityDiff,
        totalPrice: prev.totalPrice + (itemPrice * quantityDiff),
      } : null);

      setSummary(prev => prev ? {
        ...prev,
        totalQuantity: prev.totalQuantity + quantityDiff,
      } : null);

      if (productId) {
        await cartClientApi.updateCartItem(productId, { quantity });
      } else if (offerId) {
        await cartClientApi.updateOfferCartItem(offerId, { quantity });
      }
    } catch (err) {
      // Revert optimistic update
      await loadCart();
      throw err;
    }
  }, [token, cart, loadCart]);

  // Remove from cart
  const removeFromCart = useCallback(async (productId?: string, offerId?: string) => {
    if (!token || !cart) return;
    
    const currentItem = productId 
      ? cart.items.find(item => item.productId === productId)
      : cart.items.find(item => item.offerId === offerId);
    
    if (!currentItem) return;

    const itemPrice = currentItem.product?.price || currentItem.offer?.price || 0;

    try {
      // Optimistic update
      setCart(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => 
          productId ? item.productId !== productId : item.offerId !== offerId
        ),
        totalQuantity: prev.totalQuantity - currentItem.quantity,
        totalPrice: prev.totalPrice - (itemPrice * currentItem.quantity),
      } : null);

      setSummary(prev => prev ? {
        ...prev,
        totalQuantity: prev.totalQuantity - currentItem.quantity,
        itemsCount: prev.itemsCount - 1,
      } : null);

      if (productId) {
        await cartClientApi.removeFromCart(productId);
      } else if (offerId) {
        await cartClientApi.removeOfferFromCart(offerId);
      }
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
      setCart({
        id: cart?.id || '',
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
        createdAt: cart?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setSummary({
        totalQuantity: 0,
        totalPrice: 0,
        itemsCount: 0,
      });

      await cartClientApi.clearCart();
      
      // Force reload to ensure sync with server
      await loadCart();
    } catch (err) {
      // Revert optimistic update
      await loadCart();
      throw err;
    }
  }, [token, cart, loadCart]);

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