'use client';

import { useState, useEffect } from 'react';
import { ordersApi, Order } from '@/lib/api/orders';
import { useAuth } from '@/lib/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface UserOrdersTabProps {
  userId: string;
}

export function UserOrdersTab({ userId }: UserOrdersTabProps) {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const loadOrders = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await ordersApi.getAllOrders({
        userId,
        limit: 100,
      }, accessToken);
      setOrders(response.items);
    } catch (error) {
      console.error('Failed to load user orders:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        У пользователя пока нет заказов
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Заказы пользователя</h2>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <Link
                  href={`/panel/orders/${order.id}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  Заказ №{order.orderNumber}
                </Link>
                <Badge variant={getStatusBadgeVariant(order.status.code)}>
                  {order.status.name}
                </Badge>
              </div>
              <span className="text-sm text-gray-600">
                {format(new Date(order.createdAt), 'd MMMM yyyy', { locale: ru })}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Сумма:</span>
                <span className="ml-2 font-medium">{formatPrice(order.grandTotal)}</span>
              </div>
              <div>
                <span className="text-gray-600">Товаров:</span>
                <span className="ml-2 font-medium">{order.items.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Способ доставки:</span>
                <span className="ml-2">{order.deliveryMethod.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}