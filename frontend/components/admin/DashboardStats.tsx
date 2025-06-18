'use client';

import { useEffect, useState } from 'react';
import { 
  CubeIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  todayOrders: number;
  pendingOrders: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement API call to get stats
    // For now, using mock data
    setTimeout(() => {
      setStats({
        totalProducts: 125,
        totalOrders: 48,
        totalUsers: 312,
        totalRevenue: 125400,
        todayOrders: 5,
        pendingOrders: 12,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Всего товаров',
      value: stats?.totalProducts || 0,
      icon: CubeIcon,
      color: 'bg-blue-500',
    },
    {
      label: 'Всего заказов',
      value: stats?.totalOrders || 0,
      icon: ShoppingCartIcon,
      color: 'bg-green-500',
      subtext: `${stats?.todayOrders || 0} сегодня`,
    },
    {
      label: 'Пользователей',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'bg-purple-500',
    },
    {
      label: 'Общий доход',
      value: `${(stats?.totalRevenue || 0).toLocaleString()} ₽`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-full p-3 text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.subtext && (
                    <p className="text-xs text-gray-500">{stat.subtext}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {stats?.pendingOrders && stats.pendingOrders > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ShoppingCartIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Внимание! У вас {stats.pendingOrders} необработанных заказов
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Рекомендуем обработать заказы как можно скорее.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}