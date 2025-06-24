"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/lib/api/products"
import { Badge } from "@/components/ui/badge"
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { getImageUrl } from "@/lib/utils/image"

interface ProductsColumnsProps {
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  deleting: string | null
}

export const createProductsColumns = ({
  onEdit,
  onDelete,
  deleting,
}: ProductsColumnsProps): ColumnDef<Product>[] => [
  {
    accessorKey: "productImages",
    header: "Фото",
    cell: ({ row }) => {
      const product = row.original
      // Находим главное изображение или берем первое
      const mainImage =
        product.productImages?.find(img => img.isMain) ||
        product.productImages?.[0]

      return mainImage ? (
        <Image
          src={getImageUrl(mainImage.url)}
          alt={mainImage.alt || product.name}
          width={50}
          height={50}
          className="object-cover rounded-lg"
        />
      ) : (
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-[7px] text-gray-400">Нет фото</span>
        </div>
      )
    },
  },
  {
    accessorKey: "name",
    header: "Товар",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-muted-foreground">{product.sku}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Цена",
    cell: ({ row }) => {
      const product = row.original
      return `${product.price.toLocaleString()} ₽`
    },
  },
  {
    accessorKey: "stock",
    header: "Остаток",
    cell: ({ row }) => {
      const product = row.original
      return (
        <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
          {product.stock}
        </span>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: "Статус",
    cell: ({ row }) => {
      const product = row.original
      return (
        <Badge variant={product.isActive ? "default" : "secondary"}>
          {product.isActive ? "Активен" : "Неактивен"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={e => {
              e.stopPropagation()
              onEdit(product)
            }}
            className="text-blue-600 hover:text-blue-900"
            title="Редактировать">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation()
              onDelete(product.id)
            }}
            disabled={deleting === product.id}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
            title="Удалить">
            {deleting === product.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )
    },
  },
]
