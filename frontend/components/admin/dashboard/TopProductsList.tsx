interface TopProduct {
  id: string
  name: string
  sku: string
  sold: number
  revenue: number
}

interface TopProductsListProps {
  products: TopProduct[]
}

export function TopProductsList({ products }: TopProductsListProps) {
  const formatRevenue = (value: number) => {
    return new Intl.NumberFormat('ru-RU').format(value)
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold">Топ товаров</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-y">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Товар
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Продано
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Выручка
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product, index) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {product.sold}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  {formatRevenue(product.revenue)} ₽
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}