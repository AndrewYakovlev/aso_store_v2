'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TrashIcon, MinusIcon, PlusIcon, ShoppingCartIcon, ClockIcon, TicketIcon } from '@heroicons/react/24/outline'
import { useCartContext } from '@/lib/contexts/CartContext'
import { ProductImage } from '@/components/products/ProductImage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { getImageUrl } from '@/lib/utils/image'
import { cartApiWithAuth } from '@/lib/api/cart-client-auth'
import { toast } from '@/components/ui/use-toast'

export default function CartPage() {
  const router = useRouter()
  const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCartContext()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [promoCode, setPromoCode] = useState('')
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [promoValidation, setPromoValidation] = useState<{
    code?: string;
    discountAmount?: number;
    discountType?: string;
    error?: string;
  } | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleUpdateQuantity = async (productId: string | undefined, newQuantity: number, offerId?: string) => {
    if (newQuantity < 1) return
    
    const itemId = productId || offerId || ''
    setUpdatingItems(prev => new Set(prev).add(itemId))
    try {
      await updateCartItem(productId, newQuantity, offerId)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (productId?: string, offerId?: string) => {
    const itemId = productId || offerId || ''
    setUpdatingItems(prev => new Set(prev).add(itemId))
    try {
      await removeFromCart(productId, offerId)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return

    setApplyingPromo(true)
    try {
      const summary = await cartApiWithAuth.getCartSummary(promoCode)
      if (summary.promoCode) {
        setPromoValidation(summary.promoCode)
        if (!summary.promoCode.error) {
          toast({
            title: 'Промокод применен',
            description: `Скидка ${formatPrice(summary.promoCode.discountAmount)} будет применена при оформлении заказа`,
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось проверить промокод',
        variant: 'destructive',
      })
    } finally {
      setApplyingPromo(false)
    }
  }

  const handleRemovePromoCode = () => {
    setPromoCode('')
    setPromoValidation(null)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Корзина</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await clearCart();
              toast({
                title: 'Корзина очищена',
                description: 'Все товары удалены из корзины',
              });
            } catch (error) {
              toast({
                title: 'Ошибка',
                description: 'Не удалось очистить корзину',
                variant: 'destructive',
              });
            }
          }}
          className="w-full sm:w-auto"
        >
          Очистить корзину
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const isOffer = !!item.offer;
            const product = item.product || item.offer;
            const itemId = item.productId || item.offerId || '';
            const price = product?.price || 0;
            const oldPrice = item.offer?.oldPrice;
            const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

            return (
              <Card key={item.id} className="p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  {/* Product/Offer image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 relative">
                    {isOffer ? (
                      item.offer?.image ? (
                        <img
                          src={getImageUrl(item.offer.image)}
                          alt={item.offer.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )
                    ) : (
                      <Link href={`/product/${item.product?.slug}`}>
                        {(() => {
                          const mainImage = item.product?.productImages?.find(img => img.isMain);
                          const imageUrl = mainImage?.url || item.product?.productImages?.[0]?.url || item.product?.images?.[0];
                          
                          return imageUrl ? (
                            <img
                              src={getImageUrl(imageUrl)}
                              alt={item.product?.name || 'Product image'}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                              <ShoppingCartIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          );
                        })()}
                      </Link>
                    )}
                  </div>

                  {/* Product/Offer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        {isOffer ? (
                          <>
                            <h3 className="text-sm sm:text-base font-medium line-clamp-2">
                              {item.offer?.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                              {item.offer?.isOriginal && (
                                <Badge className="bg-green-600 text-white text-xs py-0 px-1">
                                  Оригинал
                                </Badge>
                              )}
                              {item.offer?.isAnalog && (
                                <Badge className="bg-blue-600 text-white text-xs py-0 px-1">
                                  Аналог
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                Предложение
                              </Badge>
                              {item.offer?.deliveryDays !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  {item.offer.deliveryDays} дн.
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <Link 
                              href={`/product/${item.product?.slug}`}
                              className="text-sm sm:text-base font-medium hover:text-primary line-clamp-2 block"
                            >
                              {item.product?.name}
                            </Link>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Артикул: {item.product?.sku}
                            </p>
                            {item.product?.stock !== undefined && item.product.stock < 10 && (
                              <p className="text-xs text-orange-600">
                                Осталось {item.product.stock} шт.
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Desktop price and quantity */}
                      <div className="hidden sm:flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-base font-bold">
                            {formatPrice(price * item.quantity)}
                          </p>
                          {oldPrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPrice(oldPrice * item.quantity)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1, item.offerId)}
                            disabled={updatingItems.has(itemId) || item.quantity <= 1}
                          >
                            <MinusIcon className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1, item.offerId)}
                            disabled={updatingItems.has(itemId) || (isOffer ? false : item.quantity >= (item.product?.stock || 0))}
                          >
                            <PlusIcon className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 ml-2"
                            onClick={() => handleRemoveItem(item.productId, item.offerId)}
                            disabled={updatingItems.has(itemId)}
                          >
                            <TrashIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile price and controls */}
                    <div className="flex sm:hidden items-center justify-between mt-2 pt-2 border-t">
                      <div>
                        <p className="text-sm font-bold">
                          {formatPrice(price * item.quantity)}
                        </p>
                        {oldPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(oldPrice * item.quantity)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1, item.offerId)}
                          disabled={updatingItems.has(itemId) || item.quantity <= 1}
                        >
                          <MinusIcon className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1, item.offerId)}
                          disabled={updatingItems.has(itemId) || (isOffer ? false : item.quantity >= (item.product?.stock || 0))}
                        >
                          <PlusIcon className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 ml-2"
                          onClick={() => handleRemoveItem(item.productId, item.offerId)}
                          disabled={updatingItems.has(itemId)}
                        >
                          <TrashIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card className="p-4 sm:p-6 sticky top-4">
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
              {promoValidation && !promoValidation.error && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Скидка:</span>
                  <span>-{formatPrice(promoValidation.discountAmount || 0)}</span>
                </div>
              )}
            </div>

            {/* Promo code section */}
            <div className="border-t pt-4 mb-4">
              <div className="space-y-2">
                {!promoValidation || promoValidation.error ? (
                  <>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Введите промокод"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                        disabled={applyingPromo}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleApplyPromoCode}
                        disabled={!promoCode.trim() || applyingPromo}
                      >
                        {applyingPromo ? 'Проверка...' : 'Применить'}
                      </Button>
                    </div>
                    {promoValidation?.error && (
                      <p className="text-sm text-destructive">{promoValidation.error}</p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="flex items-center gap-2">
                      <TicketIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{promoValidation.code}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={handleRemovePromoCode}
                    >
                      Удалить
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>К оплате:</span>
                <span>
                  {formatPrice(
                    cart.totalPrice - (promoValidation && !promoValidation.error ? promoValidation.discountAmount || 0 : 0)
                  )}
                </span>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => {
                const params = new URLSearchParams()
                if (promoValidation && !promoValidation.error && promoValidation.code) {
                  params.set('promo', promoValidation.code)
                }
                router.push(`/checkout${params.toString() ? '?' + params.toString() : ''}`)
              }}
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