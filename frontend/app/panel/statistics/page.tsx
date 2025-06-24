"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/contexts/AuthContext"
import { StatCard } from "@/components/admin/dashboard/StatCard"
import {
  StatisticsApi,
  OverallStatistics,
  PeriodicStatisticsItem,
  TopProduct,
  OrderStatusStatistics,
  PaymentMethodStatistics,
  NewCustomersStatistics,
} from "@/lib/api/statistics"
import {
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CubeIcon,
  ClockIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline"

export default function StatisticsPage() {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const [overallStats, setOverallStats] = useState<OverallStatistics | null>(
    null
  )
  const [periodicStats, setPeriodicStats] = useState<PeriodicStatisticsItem[]>(
    []
  )
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [orderStatusStats, setOrderStatusStats] = useState<
    OrderStatusStatistics[]
  >([])
  const [paymentMethodStats, setPaymentMethodStats] = useState<
    PaymentMethodStatistics[]
  >([])
  const [newCustomersStats, setNewCustomersStats] =
    useState<NewCustomersStatistics | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month"
  >("week")

  useEffect(() => {
    if (accessToken) {
      loadStatistics()
    }
  }, [accessToken, selectedPeriod])

  const loadStatistics = async () => {
    if (!accessToken) return

    try {
      setLoading(true)
      const [
        overall,
        periodic,
        products,
        orderStatus,
        paymentMethods,
        newCustomers,
      ] = await Promise.all([
        StatisticsApi.getOverallStatistics(accessToken),
        StatisticsApi.getPeriodicStatistics(accessToken, selectedPeriod),
        StatisticsApi.getTopProducts(accessToken, 10),
        StatisticsApi.getOrderStatusStatistics(accessToken),
        StatisticsApi.getPaymentMethodStatistics(accessToken),
        StatisticsApi.getNewCustomersStatistics(accessToken, 30),
      ])

      setOverallStats(overall)
      setPeriodicStats(periodic)
      setTopProducts(products)
      setOrderStatusStats(orderStatus)
      setPaymentMethodStats(paymentMethods)
      setNewCustomersStats(newCustomers)
    } catch (error) {
      console.error("Failed to load statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value)
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("ru-RU").format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aso-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Статистика</h1>
        <p className="mt-1 text-sm text-gray-500">
          Общая статистика и аналитика магазина
        </p>
      </div>

      {/* Overall Statistics */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Всего заказов"
            value={formatNumber(overallStats.totalOrders)}
            icon={<ShoppingCartIcon className="h-6 w-6 text-aso-blue" />}
          />
          <StatCard
            title="Общая выручка"
            value={formatCurrency(overallStats.totalRevenue)}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-green-600" />}
          />
          <StatCard
            title="Клиентов"
            value={formatNumber(overallStats.totalCustomers)}
            icon={<UserGroupIcon className="h-6 w-6 text-purple-600" />}
          />
          <StatCard
            title="Товаров"
            value={formatNumber(overallStats.totalProducts)}
            icon={<CubeIcon className="h-6 w-6 text-orange-600" />}
          />
        </div>
      )}

      {/* Today's Statistics */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Заказов сегодня"
            value={formatNumber(overallStats.todayOrders)}
            icon={<CalendarDaysIcon className="h-6 w-6 text-blue-600" />}
          />
          <StatCard
            title="Выручка сегодня"
            value={formatCurrency(overallStats.todayRevenue)}
            icon={<ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />}
          />
          <StatCard
            title="Активных заказов"
            value={formatNumber(overallStats.activeOrders)}
            icon={<ClockIcon className="h-6 w-6 text-yellow-600" />}
          />
        </div>
      )}

      {/* New Customers */}
      {newCustomersStats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Новые клиенты (последние 30 дней)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Новых регистраций</p>
              <p className="text-2xl font-bold">
                {formatNumber(newCustomersStats.newCustomers)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Сделали заказ</p>
              <p className="text-2xl font-bold">
                {formatNumber(newCustomersStats.customersWithOrders)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Конверсия</p>
              <p className="text-2xl font-bold">
                {newCustomersStats.conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Period Selector and Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Динамика заказов и выручки</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod("day")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === "day"
                  ? "bg-aso-blue text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              По дням
            </button>
            <button
              onClick={() => setSelectedPeriod("week")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === "week"
                  ? "bg-aso-blue text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              По неделям
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === "month"
                  ? "bg-aso-blue text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              По месяцам
            </button>
          </div>
        </div>

        {periodicStats.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Период
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заказов
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Выручка
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {periodicStats.map((stat, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(stat.orders)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(stat.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Status Statistics */}
      {orderStatusStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Заказы по статусам</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {orderStatusStats.map(status => (
              <div key={status.statusId} className="text-center">
                <div
                  className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-2"
                  style={{ backgroundColor: status.statusColor + "20" }}>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: status.statusColor }}>
                    {status.orderCount}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{status.statusName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Method Statistics */}
      {paymentMethodStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Методы оплаты</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Метод оплаты
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заказов
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentMethodStats.map(method => (
                  <tr key={method.methodId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {method.methodName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(method.orderCount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(method.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Топ-10 товаров</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Артикул
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Бренд
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заказов
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Продано
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Выручка
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={product.productId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{index + 1}. {product.productName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.productSku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.brand || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(product.orderCount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(product.totalQuantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(product.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
