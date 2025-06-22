"use client"

import { useMemo } from "react"

interface OrdersChartProps {
  data: Array<{
    date: string
    orders: number
    revenue: number
  }>
}

export function OrdersChart({ data }: OrdersChartProps) {
  const maxRevenue = useMemo(() => {
    return Math.max(...data.map(d => d.revenue))
  }, [data])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const formatRevenue = (value: number) => {
    return new Intl.NumberFormat('ru-RU').format(value)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Заказы за последние 7 дней</h3>
      
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.date} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{formatDate(item.date)}</span>
              <div className="flex gap-4">
                <span>{item.orders} заказов</span>
                <span className="font-medium">{formatRevenue(item.revenue)} ₽</span>
              </div>
            </div>
            <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
                style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center px-3">
                <span className="text-xs font-medium text-gray-700">
                  {item.orders}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}