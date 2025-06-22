"use client"

import { useState, useEffect } from "react"
import { statisticsApi, DashboardStatistics } from "@/lib/api/statistics"
import { useAuth } from "@/lib/contexts/AuthContext"
import { 
  CurrencyDollarIcon, 
  UsersIcon, 
  CubeIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon
} from "@heroicons/react/24/outline"
import { Loader2 } from "lucide-react"
import { StatCard } from "./StatCard"
import { OrdersChart } from "./OrdersChart"
import { TopProductsList } from "./TopProductsList"
import { RecentOrdersList } from "./RecentOrdersList"

export function AdminDashboard() {
  const { accessToken } = useAuth()
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    setLoading(true)
    try {
      const data = await statisticsApi.getDashboard(accessToken!)
      setStatistics(data)
    } catch (error) {
      console.error("Failed to load statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !statistics) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('ru-RU').format(value)
  }

  const calculateTrend = (today: number, yesterday: number) => {
    if (yesterday === 0) return { value: 0, isPositive: today > 0 }
    const change = ((today - yesterday) / yesterday) * 100
    return { value: Math.round(change), isPositive: change >= 0 }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Дашборд</h1>
        <p className="text-gray-600">Статистика и аналитика магазина</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Общая выручка"
          value={`${formatPrice(statistics.overview.totalRevenue)} ₽`}
          description="За все время"
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          color="green"
          trend={calculateTrend(
            statistics.periods.today.revenue,
            statistics.periods.yesterday.revenue
          )}
        />
        <StatCard
          title="Заказы"
          value={statistics.overview.totalOrders}
          description="Всего заказов"
          icon={<ShoppingBagIcon className="h-6 w-6" />}
          color="blue"
          trend={calculateTrend(
            statistics.periods.today.orders,
            statistics.periods.yesterday.orders
          )}
        />
        <StatCard
          title="Клиенты"
          value={statistics.overview.totalUsers}
          description="Зарегистрировано"
          icon={<UsersIcon className="h-6 w-6" />}
          color="purple"
          trend={calculateTrend(
            statistics.periods.today.users,
            statistics.periods.yesterday.users
          )}
        />
        <StatCard
          title="Товары"
          value={statistics.overview.totalProducts}
          description="В каталоге"
          icon={<CubeIcon className="h-6 w-6" />}
          color="yellow"
        />
        <StatCard
          title="Активные чаты"
          value={statistics.overview.activeChats}
          description="Требуют внимания"
          icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          title="В обработке"
          value={statistics.overview.pendingOrders}
          description="Ожидают действий"
          icon={<ClockIcon className="h-6 w-6" />}
          color="yellow"
        />
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Сегодня</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Заказов</span>
              <span className="text-sm font-medium">{statistics.periods.today.orders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Выручка</span>
              <span className="text-sm font-medium">{formatPrice(statistics.periods.today.revenue)} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Новых клиентов</span>
              <span className="text-sm font-medium">{statistics.periods.today.users}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Вчера</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Заказов</span>
              <span className="text-sm font-medium">{statistics.periods.yesterday.orders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Выручка</span>
              <span className="text-sm font-medium">{formatPrice(statistics.periods.yesterday.revenue)} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Новых клиентов</span>
              <span className="text-sm font-medium">{statistics.periods.yesterday.users}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">За неделю</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Заказов</span>
              <span className="text-sm font-medium">{statistics.periods.week.orders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Выручка</span>
              <span className="text-sm font-medium">{formatPrice(statistics.periods.week.revenue)} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Новых клиентов</span>
              <span className="text-sm font-medium">{statistics.periods.week.users}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">За месяц</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Заказов</span>
              <span className="text-sm font-medium">{statistics.periods.month.orders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Выручка</span>
              <span className="text-sm font-medium">{formatPrice(statistics.periods.month.revenue)} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Новых клиентов</span>
              <span className="text-sm font-medium">{statistics.periods.month.users}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersChart data={statistics.ordersChart} />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Распределение по статусам</h3>
          <div className="space-y-3">
            {statistics.ordersByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{item.status}</span>
                  <span className="text-sm text-gray-500">({item.count})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsList products={statistics.topProducts} />
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Топ категорий</h3>
          </div>
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {statistics.topCategories.map((category, index) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatPrice(category.revenue)} ₽</div>
                    <div className="text-xs text-gray-500">{category.orders} заказов</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RecentOrdersList orders={statistics.recentOrders} />
    </div>
  )
}