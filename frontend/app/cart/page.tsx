'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TrashIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useCartContext } from '@/lib/contexts/CartContext'
import { ProductImage } from '@/components/products/ProductImage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function CartPage() {
  const router = useRouter()
  const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCartContext()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setUpdatingItems(prev => new Set(prev).add(productId))
    try {
      await updateCartItem(productId, newQuantity)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (productId: string) => {
    setUpdatingItems(prev => new Set(prev).add(productId))
    try {
      await removeFromCart(productId)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Корзина</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка корзины...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Корзина</h1>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <ShoppingCartIcon className="w-24 h-24 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Корзина пуста</h2>
          <p className="text-muted-foreground mb-6">
            Добавьте товары в корзину для оформления заказа
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Корзина</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => clearCart()}
        >
          Очистить корзину
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                {/* Product image */}
                <div className="w-24 h-24 flex-shrink-0">
                  <Link href={`/product/${item.product.slug}`}>
                    {item.product.images.length > 0 ? (
                      <ProductImage
                        src={item.product.images[0]}
                        alt={item.product.name}
                        sizes="96px"
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                        <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </Link>
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/product/${item.product.slug}`}
                    className="text-lg font-medium hover:text-primary line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Артикул: {item.product.sku}
                  </p>
                  {item.product.stock < 10 && (
                    <p className="text-sm text-orange-600 mt-1">
                      Осталось {item.product.stock} шт.
                    </p>
                  )}
                </div>

                {/* Quantity and price */}
                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-bold">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      disabled={updatingItems.has(item.productId) || item.quantity <= 1}
                    >
                      <MinusIcon className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      disabled={updatingItems.has(item.productId) || item.quantity >= item.product.stock}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleRemoveItem(item.productId)}
                    disabled={updatingItems.has(item.productId)}
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Удалить
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Итого</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Товаров:</span>
                <span>{cart.totalQuantity} шт.</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Сумма:</span>
                <span>{formatPrice(cart.totalPrice)}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>К оплате:</span>
                <span>{formatPrice(cart.totalPrice)}</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => router.push('/checkout')}
            >
              Оформить заказ
            </Button>

            <div className="mt-4 text-center">
              <Link 
                href="/catalog"
                className="text-sm text-primary hover:underline"
              >
                Продолжить покупки
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}