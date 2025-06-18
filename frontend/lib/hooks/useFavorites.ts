'use client'

import { useState, useEffect, useCallback } from 'react';
import { favoritesApi } from '@/lib/api/favorites';
import { useAnonymousToken } from './useAnonymousToken';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAnonymousToken();

  // Load favorite IDs
  const loadFavorites = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const ids = await favoritesApi.getIds();
      setFavoriteIds(new Set(ids));
      setError(null);
    } catch (err) {
      setError('Failed to load favorites');
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (productId: string) => {
    if (!token) return;
    
    const isCurrentlyFavorite = favoriteIds.has(productId);
    
    // Optimistic update
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyFavorite) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });

    try {
      if (isCurrentlyFavorite) {
        await favoritesApi.remove(productId);
      } else {
        await favoritesApi.add(productId);
      }
    } catch (err) {
      // Revert optimistic update on error
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyFavorite) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });
      throw err;
    }
  }, [favoriteIds, token]);

  // Check if product is favorite
  const isFavorite = useCallback((productId: string) => {
    return favoriteIds.has(productId);
  }, [favoriteIds]);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favoriteIds: Array.from(favoriteIds),
    loading,
    error,
    toggleFavorite,
    isFavorite,
    refetch: loadFavorites,
  };
}