import Link from "next/link"

interface RecentOrder {
  id: string
  orderNumber: string
  status: {
    id: string
    name: string
    color: string
  }
  total: number
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName?: string
    phone: string
  }
}

interface RecentOrdersListProps {
  orders: RecentOrder[]
}

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('ru-RU').format(value)
  }

  const formatName = (user: RecentOrder['user']) => {
    return [user.lastName, user.firstName].filter(Boolean).join(' ') || user.phone
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Последние заказы</h3>
        <Link
          href="/panel/orders"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Все заказы →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-y">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Заказ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Клиент
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link
                    href={`/panel/orders/${order.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {order.orderNumber}
                  </Link>
                  <div className="text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{formatName(order.user)}</div>
                  <div className="text-xs text-gray-500">{order.user.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `${order.status.color}20`,
                      color: order.status.color,
                    }}
                  >
                    {order.status.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  {formatPrice(order.total)} ₽
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}