'use client'

import { useState } from 'react'
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/button'
import { useFavoritesContext } from '@/lib/contexts/FavoritesContext'

interface ProductActionsProps {
  productId: string
  inStock: boolean
}

export function ProductActions({ productId, inStock }: ProductActionsProps) {
  const { isFavorite, toggleFavorite } = useFavoritesContext()
  const [isToggling, setIsToggling] = useState(false)
  
  const isInFavorites = isFavorite(productId)
  
  const handleToggleFavorite = async () => {
    try {
      setIsToggling(true)
      await toggleFavorite(productId)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div className="flex gap-3">
      <Button 
        size="lg" 
        className="flex-1"
        disabled={!inStock}
      >
        <ShoppingCartIcon className="w-5 h-5 mr-2" />
        Добавить в корзину
      </Button>
      <Button 
        size="lg" 
        variant="outline"
        onClick={handleToggleFavorite}
        disabled={isToggling}
      >
        {isInFavorites ? (
          <HeartIconSolid className="w-5 h-5 text-red-500" />
        ) : (
          <HeartIcon className="w-5 h-5" />
        )}
      </Button>
    </div>
  )
}