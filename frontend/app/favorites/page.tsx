'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeartIcon } from '@heroicons/react/24/outline'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { favoritesApi } from '@/lib/api/favorites'
import { Product } from '@/lib/api/products'
import { useFavoritesContext } from '@/lib/contexts/FavoritesContext'
import { Button } from '@/components/ui/button'

export default function FavoritesPage() {
  const { favoriteIds, loading: contextLoading } = useFavoritesContext()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFavoriteProducts = async () => {
      try {
        setLoading(true)
        const favorites = await favoritesApi.getAll()
        setProducts(favorites.map(f => f.product))
        setError(null)
      } catch (err) {
        setError('Не удалось загрузить избранные товары')
        console.error('Error loading favorite products:', err)
      } finally {
        setLoading(false)
      }
    }

    if (!contextLoading && favoriteIds.length > 0) {
      loadFavoriteProducts()
    } else if (!contextLoading && favoriteIds.length === 0) {
      setProducts([])
      setLoading(false)
    }
  }, [favoriteIds, contextLoading])

  if (loading || contextLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Избранное</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка избранных товаров...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Избранное</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Избранное</h1>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <HeartIcon className="w-24 h-24 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">В избранном пока ничего нет</h2>
          <p className="text-muted-foreground mb-6">
            Добавляйте товары в избранное, чтобы быстро находить их позже
          </p>
          <Link href="/catalog">
            <Button>Перейти в каталог</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Избранное</h1>
      <p className="text-muted-foreground mb-8">
        {products.length} {products.length === 1 ? 'товар' : products.length < 5 ? 'товара' : 'товаров'}
      </p>
      <ProductsGrid products={products} />
    </div>
  )
}