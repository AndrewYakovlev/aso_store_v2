'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ordersApi, Order } from '@/lib/api/orders';
import { ordersClientApi } from '@/lib/api/orders-client';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [resolvedParams.id]);

  const loadOrder = async () => {
    try {
      const orderData = await ordersClientApi.getById(resolvedParams.id);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order:', error);
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const getStatusBadgeVariant = (statusCode: string) => {
    switch (statusCode) {
      case 'new':
        return 'default';
      case 'processing':
      case 'confirmed':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'delivered':
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/orders')}
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Вернуться к заказам
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order header */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">
                Заказ №{order.orderNumber}
              </h1>
              <Badge variant={getStatusBadgeVariant(order.status.code)}>
                {order.status.name}
              </Badge>
            </div>
            
            <p className="text-gray-600">
              Оформлен {format(new Date(order.createdAt), 'd MMMM yyyy в HH:mm', { locale: ru })}
            </p>
          </Card>

          {/* Order items */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Товары в заказе</h2>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                  {item.product && (
                    <>
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.product.images[0] || '/placeholder.png'}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          Артикул: {item.product.sku}
                        </p>
                        <p className="text-sm mt-2">
                          {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Информация о доставке</h2>
            
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Способ доставки:</span>
                <span className="ml-2 font-medium">{order.deliveryMethod.name}</span>
              </div>
              
              {order.deliveryAddress && (
                <div>
                  <span className="text-gray-600">Адрес доставки:</span>
                  <p className="mt-1">{order.deliveryAddress}</p>
                </div>
              )}
              
              {(order.deliveryCity || order.deliveryStreet) && (
                <div>
                  <span className="text-gray-600">Адрес доставки:</span>
                  <p className="mt-1">
                    {[
                      order.deliveryCity,
                      order.deliveryStreet,
                      order.deliveryBuilding,
                      order.deliveryApartment && `кв. ${order.deliveryApartment}`,
                    ].filter(Boolean).join(', ')}
                  </p>
                  {order.deliveryPostalCode && (
                    <p className="text-sm text-gray-600">Индекс: {order.deliveryPostalCode}</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Информация о заказе</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Получатель</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Телефон</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
              
              {order.customerEmail && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600">Способ оплаты</p>
                <p className="font-medium">{order.paymentMethod.name}</p>
              </div>
              
              {order.comment && (
                <div>
                  <p className="text-sm text-gray-600">Комментарий</p>
                  <p className="text-sm mt-1">{order.comment}</p>
                </div>
              )}
            </div>
            
            <div className="border-t mt-6 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Товары:</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Доставка:</span>
                <span>{order.deliveryAmount > 0 ? formatPrice(order.deliveryAmount) : 'Бесплатно'}</span>
              </div>
              
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Итого:</span>
                <span>{formatPrice(order.grandTotal)}</span>
              </div>
            </div>

            {order.status.code === 'delivered' && (
              <Button className="w-full mt-6">
                Повторить заказ
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}