'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ordersApi, Order } from '@/lib/api/orders';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      loadOrder();
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const loadOrder = async () => {
    try {
      const orderData = await ordersApi.getByOrderNumber(orderNumber!);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Заказ не найден</h1>
          <Button onClick={() => router.push('/')}>
            На главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold mb-4">Заказ успешно оформлен!</h1>
        
        <p className="text-xl mb-8">
          Номер вашего заказа: <span className="font-semibold">{order.orderNumber}</span>
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold mb-4">Информация о заказе</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Статус:</span>
              <span className="font-medium">{order.status.name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Способ доставки:</span>
              <span className="font-medium">{order.deliveryMethod.name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Способ оплаты:</span>
              <span className="font-medium">{order.paymentMethod.name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Сумма заказа:</span>
              <span className="font-medium">{order.totalAmount} ₽</span>
            </div>
            
            {order.deliveryAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Доставка:</span>
                <span className="font-medium">{order.deliveryAmount} ₽</span>
              </div>
            )}
            
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Итого:</span>
              <span className="font-semibold text-lg">{order.grandTotal} ₽</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <p className="text-blue-800">
            Мы свяжемся с вами по телефону <strong>{order.customerPhone}</strong> для подтверждения заказа.
          </p>
          {order.customerEmail && (
            <p className="text-blue-800 mt-2">
              Информация о заказе также отправлена на email: <strong>{order.customerEmail}</strong>
            </p>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/orders')}
          >
            Мои заказы
          </Button>
          
          <Button
            onClick={() => router.push('/catalog')}
          >
            Продолжить покупки
          </Button>
        </div>
      </div>
    </div>
  );
}