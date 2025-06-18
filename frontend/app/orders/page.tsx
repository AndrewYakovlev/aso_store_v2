'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ordersApi, Order, OrderStatus } from '@/lib/api/orders';
import { ordersClientApi } from '@/lib/api/orders-client';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadStatuses();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, page]);

  const loadStatuses = async () => {
    try {
      const statusList = await ordersApi.getStatuses();
      setStatuses(statusList);
    } catch (error) {
      console.error('Failed to load statuses:', error);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await ordersClientApi.getOrders({
        statusId: selectedStatus || undefined,
        page,
        limit: 10,
      });
      setOrders(result.items);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>

      {/* Status filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={selectedStatus === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSelectedStatus('');
            setPage(1);
          }}
        >
          Все заказы
        </Button>
        {statuses.map((status) => (
          <Button
            key={status.id}
            variant={selectedStatus === status.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedStatus(status.id);
              setPage(1);
            }}
          >
            {status.name}
          </Button>
        ))}
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">
            {selectedStatus ? 'Нет заказов с выбранным статусом' : 'У вас пока нет заказов'}
          </p>
          <Button onClick={() => router.push('/catalog')}>
            Перейти в каталог
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      Заказ №{order.orderNumber}
                    </h3>
                    <Badge variant={getStatusBadgeVariant(order.status.code)}>
                      {order.status.name}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">
                    от {format(new Date(order.createdAt), 'd MMMM yyyy', { locale: ru })}
                  </p>
                  
                  <p className="text-sm text-gray-600">
                    {order.items.length} товар{order.items.length === 1 ? '' : order.items.length < 5 ? 'а' : 'ов'} на сумму {formatPrice(order.grandTotal)}
                  </p>

                  {/* Order items preview */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <span key={item.id} className="text-sm text-gray-600">
                        {item.product?.name}
                        {index < Math.min(2, order.items.length - 1) && ','}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-sm text-gray-600">
                        и еще {order.items.length - 3} товар{order.items.length - 3 === 1 ? '' : order.items.length - 3 < 5 ? 'а' : 'ов'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline">
                      Подробнее
                    </Button>
                  </Link>
                  
                  {order.status.code === 'delivered' && (
                    <Button variant="default">
                      Повторить заказ
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Назад
          </Button>
          
          <span className="flex items-center px-4">
            Страница {page} из {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Вперед
          </Button>
        </div>
      )}
    </div>
  );
}