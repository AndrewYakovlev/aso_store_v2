'use client';

import { useState, useEffect } from 'react';
import { ordersApi, Order, OrderStatus } from '@/lib/api/orders';
import { useAuth } from '@/lib/contexts/AuthContext';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface AdminOrderDetailsProps {
  orderId: string;
}

export function AdminOrderDetails({ orderId }: AdminOrderDetailsProps) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [orderId]);

  const loadData = async () => {
    try {
      const [orderData, statusesData] = await Promise.all([
        ordersApi.getById(orderId),
        ordersApi.getStatuses(),
      ]);
      setOrder(orderData);
      setStatuses(statusesData);
    } catch (error) {
      console.error('Failed to load order:', error);
      setError('Не удалось загрузить заказ');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatusId: string) => {
    if (!order || order.status.id === newStatusId) return;

    setUpdatingStatus(true);
    try {
      const updatedOrder = await ordersApi.updateStatus(order.id, newStatusId, accessToken!);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Ошибка при обновлении статуса заказа');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Заказ не найден'}</p>
        <Link
          href="/panel/orders"
          className="text-blue-600 hover:text-blue-800"
        >
          Вернуться к списку заказов
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/panel/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold">Заказ №{order.orderNumber}</h1>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={order.status.id}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            {statuses.map(status => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Товары */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Товары</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {item.product ? (
                        <Link
                          href={`/panel/products/${item.product.id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {item.product.name}
                        </Link>
                      ) : (
                        'Товарное предложение'
                      )}
                    </h3>
                    {item.product && (
                      <p className="text-sm text-gray-500">Артикул: {item.product.sku}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.totalPrice.toLocaleString()} ₽</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {item.price.toLocaleString()} ₽
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span>Сумма товаров:</span>
                <span className="font-medium">{order.totalAmount.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Доставка:</span>
                <span className="font-medium">{order.deliveryAmount.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Итого:</span>
                <span>{order.grandTotal.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>

          {/* Доставка */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Доставка</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Способ доставки:</span>
                <p className="font-medium">{order.deliveryMethod.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Адрес доставки:</span>
                <p className="font-medium">{order.deliveryAddress || 'Не указан'}</p>
              </div>
              {order.deliveryComment && (
                <div>
                  <span className="text-gray-600">Комментарий:</span>
                  <p className="font-medium">{order.deliveryComment}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Информация о клиенте */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Клиент</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Имя:</span>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <span className="text-gray-600">Телефон:</span>
                <p className="font-medium">
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {formatPhoneForDisplay(order.customerPhone)}
                  </a>
                </p>
              </div>
              {order.customerEmail && (
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {order.customerEmail}
                    </a>
                  </p>
                </div>
              )}
              {order.userId && (
                <div>
                  <span className="text-gray-600">ID пользователя:</span>
                  <p className="font-medium">{order.userId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Информация о заказе */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Информация</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Создан:</span>
                <p className="font-medium">
                  {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: ru })}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Обновлен:</span>
                <p className="font-medium">
                  {format(new Date(order.updatedAt), 'dd MMM yyyy HH:mm', { locale: ru })}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Способ оплаты:</span>
                <p className="font-medium">{order.paymentMethod.name}</p>
              </div>
            </div>
          </div>

          {/* Комментарий к заказу */}
          {order.comment && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Комментарий</h2>
              <p className="text-gray-700">{order.comment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}