"use client"

import { useState, useEffect } from "react"
import { Cart } from "@/lib/api/cart"
import { usersApi } from "@/lib/api/users"
import { useAuth } from "@/lib/contexts/AuthContext"
import { formatPrice } from "@/lib/utils"
import { getImageUrl } from "@/lib/utils/image"
import { Loader2 } from "lucide-react"
import Image from "next/image"

// Утилита для преобразования Decimal в число
const toNumber = (value: any): number => {
  if (typeof value === "object" && value !== null) {
    return Number(value)
  }
  return Number(value) || 0
}

interface UserCartTabProps {
  userId: string
}

export function UserCartTab({ userId }: UserCartTabProps) {
  const { accessToken } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCart()
  }, [userId])

  const loadCart = async () => {
    if (!accessToken || !userId) return

    try {
      setLoading(true)
      // Используем новый API endpoint для получения корзины пользователя
      const cart = await usersApi.getUserCart(accessToken, userId)
      setCart(cart)
    } catch (error) {
      console.error("Failed to load user cart:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Корзина пользователя пуста
      </div>
    )
  }

  // Используем общую сумму из API или вычисляем её
  const totalAmount = cart.totalPrice
    ? toNumber(cart.totalPrice)
    : cart.items.reduce((sum, item) => {
        const price = item.product?.price ? toNumber(item.product.price) : 0
        const totalPrice = price * item.quantity
        return sum + totalPrice
      }, 0)

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Корзина пользователя ({cart.items.length} товаров)
      </h2>

      <div className="space-y-4">
        {cart.items.map(item => {
          const isOffer = !!item.offer
          const product = isOffer ? item.offer : item.product

          // Получаем цену товара
          const price = product?.price ? toNumber(product.price) : 0
          const totalPrice = price * item.quantity

          // Получаем изображение в зависимости от типа товара
          let imageUrl = "/placeholder.svg"
          if (isOffer && item.offer) {
            const offerImage = item.offer.images?.[0] || item.offer.image
            imageUrl = offerImage ? getImageUrl(offerImage) : "/placeholder.svg"
          } else if (item.product) {
            // Для обычных товаров используем productImages
            const productImage =
              item.product.productImages?.[0]?.url || item.product.images?.[0]
            imageUrl = productImage
              ? getImageUrl(productImage)
              : "/placeholder.svg"
          }

          return (
            <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={product?.name || ""}
                  fill
                  className="object-cover rounded"
                />
              </div>

              <div className="flex-1">
                <h4 className="font-medium">{product?.name}</h4>
                {isOffer && (
                  <p className="text-sm text-gray-600">Товарное предложение</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  {formatPrice(price)} × {item.quantity} ={" "}
                  {formatPrice(totalPrice)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between text-lg font-semibold">
          <span>Итого:</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
      </div>
    </div>
  )
}
