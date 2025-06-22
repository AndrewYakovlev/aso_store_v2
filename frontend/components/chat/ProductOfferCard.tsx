"use client"

import { ProductOffer } from "@/types/chat"
import {
  ShoppingCart,
  Clock,
  Package,
  CheckCircle,
  Edit,
  X as XIcon,
} from "lucide-react"
import { formatDistanceToNow, isAfter } from "date-fns"
import { ru } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useCart } from "@/lib/hooks/useCart"
import { useToast } from "@/components/ui/use-toast"
import { getImageUrl } from "@/lib/utils/image"
import { useAuth } from "@/lib/contexts/AuthContext"

interface ProductOfferCardProps {
  offer: ProductOffer
  isMyMessage?: boolean
  onEdit?: () => void
  onCancel?: () => void
}

export function ProductOfferCard({
  offer,
  isMyMessage,
  onEdit,
  onCancel,
}: ProductOfferCardProps) {
  const { addToCart, loading: cartLoading } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const { toast } = useToast()
  const { user } = useAuth()

  const isExpired =
    offer.expiresAt && !isAfter(new Date(offer.expiresAt), new Date())
  const discount = offer.oldPrice
    ? Math.round(((offer.oldPrice - offer.price) / offer.oldPrice) * 100)
    : 0
  const showAdminControls =
    isMyMessage && user?.role && ["ADMIN", "MANAGER"].includes(user.role)
  const images =
    offer.images?.length > 0 ? offer.images : offer.image ? [offer.image] : []

  const handleAddToCart = async () => {
    if (!offer.isActive || isExpired) return

    try {
      setIsAdding(true)
      await addToCart({ offerId: offer.id, quantity: 1 })
      toast({
        title: "Товар добавлен в корзину",
        description: offer.name,
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар в корзину",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div
      className={`
      bg-white rounded-lg shadow-sm border p-4 max-w-sm
      ${isMyMessage ? "bg-gray-50" : "bg-white"}
      ${offer.isCancelled ? "opacity-50" : ""}
    `}>
      {/* Admin controls */}
      {showAdminControls && (
        <div className="flex justify-end gap-2 mb-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            disabled={offer.isCancelled}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={offer.isCancelled}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Image gallery */}
      {images.length > 0 && (
        <div className="mb-3">
          <div className="relative">
            <img
              src={getImageUrl(images[selectedImageIndex])}
              alt={offer.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            {(offer.isOriginal || offer.isAnalog) && (
              <div className="absolute top-2 left-2 flex gap-2">
                {offer.isOriginal && (
                  <Badge className="bg-green-600 text-white">Оригинал</Badge>
                )}
                {offer.isAnalog && (
                  <Badge className="bg-blue-600 text-white">Аналог</Badge>
                )}
              </div>
            )}
            {offer.isCancelled && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <Badge variant="destructive" className="text-lg">
                  Отменено
                </Badge>
              </div>
            )}
          </div>

          {/* Image thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  onMouseEnter={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 ${
                    selectedImageIndex === index ? "ring-2 ring-blue-500" : ""
                  }`}>
                  <img
                    src={getImageUrl(image)}
                    alt={`${offer.name} ${index + 1}`}
                    className="h-12 w-12 object-cover rounded"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-900">{offer.name}</h4>

        {offer.description && (
          <p className="text-sm text-gray-600">{offer.description}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {offer.price.toLocaleString()} ₽
          </span>
          {offer.oldPrice && (
            <>
              <span className="text-sm text-gray-500 line-through">
                {offer.oldPrice.toLocaleString()} ₽
              </span>
              <Badge variant="destructive" className="text-xs">
                -{discount}%
              </Badge>
            </>
          )}
        </div>

        {/* Delivery */}
        {offer.deliveryDays !== undefined && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              Доставка: {offer.deliveryDays}{" "}
              {offer.deliveryDays === 1
                ? "день"
                : offer.deliveryDays < 5
                  ? "дня"
                  : "дней"}
            </span>
          </div>
        )}

        {/* Expiry */}
        {offer.expiresAt && (
          <div className="text-xs text-gray-500">
            {isExpired ? (
              <span className="text-red-600">Предложение истекло</span>
            ) : (
              <span>
                Действует еще{" "}
                {formatDistanceToNow(new Date(offer.expiresAt), {
                  locale: ru,
                })}
              </span>
            )}
          </div>
        )}

        {/* Add to cart button */}
        {!isMyMessage && (
          <Button
            onClick={handleAddToCart}
            disabled={
              !offer.isActive ||
              isExpired ||
              offer.isCancelled ||
              isAdding ||
              cartLoading
            }
            className="w-full mt-3"
            size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {offer.isCancelled
              ? "Отменено"
              : isAdding
                ? "Добавляется..."
                : "В корзину"}
          </Button>
        )}
      </div>
    </div>
  )
}
