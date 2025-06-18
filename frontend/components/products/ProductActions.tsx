'use client'

import { useState } from 'react'
import { ShoppingCartIcon, HeartIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/button'
import { useFavoritesContext } from '@/lib/contexts/FavoritesContext'
import { useCartContext } from '@/lib/contexts/CartContext'

interface ProductActionsProps {
  productId: string
  inStock: boolean
}

export function ProductActions({ productId, inStock }: ProductActionsProps) {
  const { isFavorite, toggleFavorite } = useFavoritesContext()
  const { addToCart, updateCartItem, isInCart, getItemQuantity } = useCartContext()
  const [isToggling, setIsToggling] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  
  const isInFavorites = isFavorite(productId)
  const inCart = isInCart(productId)
  const cartQuantity = getItemQuantity(productId)
  
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
  
  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true)
      if (inCart) {
        await updateCartItem(productId, cartQuantity + quantity)
      } else {
        await addToCart({ productId, quantity })
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Количество:</span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <MinusIcon className="w-4 h-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setQuantity(quantity + 1)}
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-3">
        <Button 
          size="lg" 
          className="flex-1"
          disabled={!inStock || isAddingToCart}
          onClick={handleAddToCart}
        >
          <ShoppingCartIcon className="w-5 h-5 mr-2" />
          {inCart ? `Добавить (в корзине ${cartQuantity})` : 'Добавить в корзину'}
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
    </div>
  )
}