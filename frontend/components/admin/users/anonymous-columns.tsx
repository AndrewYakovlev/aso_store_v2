import { ColumnDef } from "@tanstack/react-table"
import { AnonymousUser } from "@/lib/api/anonymous-users"
import { TrashIcon } from "@heroicons/react/24/outline"
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Loader2 } from "lucide-react"

interface ColumnsProps {
  onDelete: (id: string) => void
  deleting: string | null
}

export const createAnonymousUsersColumns = ({
  onDelete,
  deleting,
}: ColumnsProps): ColumnDef<AnonymousUser>[] => [
  {
    accessorKey: "token",
    header: "Токен",
    cell: ({ row }) => {
      const token = row.original.token
      const shortToken = `${token.slice(0, 8)}...${token.slice(-8)}`
      return (
        <div className="font-mono text-sm" title={token}>
          {shortToken}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Дата создания",
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {format(new Date(row.original.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
      </div>
    ),
  },
  {
    accessorKey: "lastActivity",
    header: "Последняя активность",
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {format(new Date(row.original.lastActivity), 'dd.MM.yyyy HH:mm', { locale: ru })}
      </div>
    ),
  },
  {
    accessorKey: "_count.carts",
    header: "Корзина",
    cell: ({ row }) => {
      const count = row.original._count?.carts || 0
      return (
        <div className="text-center">
          {count > 0 ? (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
              {count}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "_count.favorites",
    header: "Избранное",
    cell: ({ row }) => {
      const count = row.original._count?.favorites || 0
      return (
        <div className="text-center">
          {count > 0 ? (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
              {count}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "_count.chats",
    header: "Чаты",
    cell: ({ row }) => {
      const count = row.original._count?.chats || 0
      return (
        <div className="text-center">
          {count > 0 ? (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
              {count}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => onDelete(row.original.id)}
          disabled={deleting === row.original.id}
          className="text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {deleting === row.original.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TrashIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    ),
  },
]