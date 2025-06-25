'use client';

import { useState, useEffect } from 'react';
import { Favorite } from '@/lib/api/favorites';
import { usersApi } from '@/lib/api/users';
import { useAuth } from '@/lib/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/utils/image';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Утилита для преобразования Decimal в число
const toNumber = (value: any): number => {
  if (typeof value === 'object' && value !== null) {
    return Number(value);
  }
  return Number(value) || 0;
};

interface UserFavoritesTabProps {
  userId: string;
}

export function UserFavoritesTab({ userId }: UserFavoritesTabProps) {
  const { accessToken } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  const loadFavorites = async () => {
    if (!accessToken || !userId) return;

    try {
      setLoading(true);
      // Используем новый API endpoint для получения избранного пользователя
      const favorites = await usersApi.getUserFavorites(accessToken, userId);
      setFavorites(favorites);
    } catch (error) {
      console.error('Failed to load user favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        У пользователя нет товаров в избранном
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Избранное ({favorites.length} товаров)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((favorite) => (
          <div key={favorite.id} className="border rounded-lg p-4">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={favorite.product.productImages?.[0]?.url 
                    ? getImageUrl(favorite.product.productImages[0].url)
                    : favorite.product.images?.[0] 
                    ? getImageUrl(favorite.product.images[0])
                    : '/placeholder.svg'}
                  alt={favorite.product.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              
              <div className="flex-1">
                <Link
                  href={`/product/${favorite.product.slug}`}
                  target="_blank"
                  className="font-medium hover:text-blue-600"
                >
                  {favorite.product.name}
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  Артикул: {favorite.product.sku}
                </p>
                <p className="font-semibold mt-2">
                  {formatPrice(toNumber(favorite.product.price))}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}