'use client';

import Image from 'next/image';
import { CartItem } from '@/lib/api/cart';
import { DeliveryMethod } from '@/lib/api/orders';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/utils/image';

interface OrderSummaryProps {
  items: CartItem[];
  deliveryMethod?: DeliveryMethod;
  totalPrice: number;
  promoCode?: {
    code: string;
    discountAmount: number;
    discountType: string;
    error?: string;
  };
}

export function OrderSummary({ items, deliveryMethod, totalPrice, promoCode }: OrderSummaryProps) {
  const deliveryPrice = deliveryMethod?.price || 0;
  const discountAmount = promoCode && !promoCode.error ? promoCode.discountAmount : 0;
  const totalWithDiscount = totalPrice - discountAmount;
  const grandTotal = totalWithDiscount + deliveryPrice;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
      
      <div className="space-y-4">
        {items.map((item) => {
          // Определяем, это обычный товар или предложение
          const isOffer = !!item.offer;
          const itemData = isOffer ? item.offer : item.product;
          
          if (!itemData) return null;
          
          const name = itemData.name;
          const price = itemData.price;
          let image = '/placeholder.png';
          
          if (isOffer) {
            const offerImage = item.offer?.images?.[0] || item.offer?.image;
            image = offerImage ? getImageUrl(offerImage) : '/placeholder.png';
          } else {
            image = item.product?.images?.[0] || '/placeholder.png';
          }
          
          return (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{name}</h4>
                <p className="text-sm text-gray-600">
                  {formatPrice(price)} × {item.quantity}
                </p>
                {isOffer && (
                  <span className="text-xs text-blue-600">Товарное предложение</span>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(price * item.quantity)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t mt-6 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Товары ({items.length})</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        
        {promoCode && !promoCode.error && discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Скидка ({promoCode.code})</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        
        {deliveryMethod && (
          <div className="flex justify-between text-sm">
            <span>Доставка</span>
            <span>{deliveryPrice > 0 ? formatPrice(deliveryPrice) : 'Бесплатно'}</span>
          </div>
        )}
        
        <div className="flex justify-between text-lg font-semibold pt-2 border-t">
          <span>Итого</span>
          <span>{formatPrice(grandTotal)}</span>
        </div>
        
        {promoCode && !promoCode.error && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded mt-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              Промокод <span className="font-medium">{promoCode.code}</span> применен успешно
            </p>
          </div>
        )}
      </div>
    </div>
  );
}