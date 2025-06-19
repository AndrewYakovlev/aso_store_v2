'use client';

import { useState, useEffect } from 'react';
import { ordersApi, Order, OrderStatus, OrdersFilter, PaginatedOrders } from '@/lib/api/orders';
import { useAuth } from '@/lib/contexts/AuthContext';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from '../DataTable';
import { createOrdersColumns } from './columns';

export function AdminOrdersList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    loadStatuses();
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get('search') || '';
    const statusId = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    setSearch(searchQuery);
    setStatusFilter(statusId);
    setCurrentPage(page);
    loadOrders(searchQuery, statusId, page);
  }, [searchParams]);

  const loadStatuses = async () => {
    try {
      const data = await ordersApi.getStatuses();
      setStatuses(data);
    } catch (error) {
      console.error('Failed to load statuses:', error);
    }
  };

  const loadOrders = async (searchQuery: string, statusId: string, page: number) => {
    setLoading(true);
    try {
      const filter: OrdersFilter = {
        orderNumber: searchQuery || undefined,
        statusId: statusId || undefined,
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      
      // Используем обычный метод getOrders, так как админский endpoint еще не создан
      const response = await ordersApi.getOrders(filter);
      setOrders(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', '1');
    router.push(`/panel/orders?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/panel/orders?${params.toString()}`);
  };

  const handleStatusChange = async (orderId: string, newStatusId: string) => {
    setUpdatingStatus(orderId);
    try {
      await ordersApi.updateStatus(orderId, newStatusId, accessToken!);
      await loadOrders(search, statusFilter, currentPage);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Ошибка при обновлении статуса заказа');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewOrder = (order: Order) => {
    router.push(`/panel/orders/${order.id}`);
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 border-b">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по номеру заказа..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Все статусы</option>
            {statuses.map(status => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Найти
          </button>
        </form>
      </div>

      <DataTable
        columns={createOrdersColumns({
          onView: handleViewOrder,
        })}
        data={orders}
      />

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Показано {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, total)} из {total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded ${
                    page === currentPage 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}