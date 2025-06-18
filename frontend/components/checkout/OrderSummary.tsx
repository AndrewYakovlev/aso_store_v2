'use client';

import Image from 'next/image';
import { CartItem } from '@/lib/api/cart';
import { DeliveryMethod } from '@/lib/api/orders';
import { formatPrice } from '@/lib/utils';

interface OrderSummaryProps {
  items: CartItem[];
  deliveryMethod?: DeliveryMethod;
  totalPrice: number;
}

export function OrderSummary({ items, deliveryMethod, totalPrice }: OrderSummaryProps) {
  const deliveryPrice = deliveryMethod?.price || 0;
  const grandTotal = totalPrice + deliveryPrice;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={item.product.images[0] || '/placeholder.png'}
                alt={item.product.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{item.product.name}</h4>
              <p className="text-sm text-gray-600">
                {formatPrice(item.product.price)} × {item.quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t mt-6 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Товары ({items.length})</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        
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
      </div>
    </div>
  );
}