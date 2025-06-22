"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User, Role } from "@/lib/api/users"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  PhoneIcon, 
  EnvelopeIcon,
  PencilSquareIcon,
  TrashIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline"
import { Loader2 } from "lucide-react"

interface ColumnsProps {
  onEdit: (user: User) => void
  onDelete: (id: string) => void
  deleting: string | null
}

const roleLabels: Record<Role, string> = {
  [Role.CUSTOMER]: 'Покупатель',
  [Role.MANAGER]: 'Менеджер',
  [Role.ADMIN]: 'Администратор',
}

const roleColors: Record<Role, string> = {
  [Role.CUSTOMER]: 'default',
  [Role.MANAGER]: 'secondary',
  [Role.ADMIN]: 'destructive',
}

export const createUsersColumns = ({ onEdit, onDelete, deleting }: ColumnsProps): ColumnDef<User>[] => [
  {
    accessorKey: "phone",
    header: "Телефон",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <PhoneIcon className="h-4 w-4 text-gray-400" />
        <span className="font-medium">{row.original.phone}</span>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "ФИО",
    cell: ({ row }) => {
      const user = row.original
      const fullName = [user.lastName, user.firstName, user.middleName]
        .filter(Boolean)
        .join(' ')
      
      return (
        <div>
          <div className="font-medium">{fullName || 'Не указано'}</div>
          {user.companyName && (
            <div className="text-sm text-gray-600">{user.companyName}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email ? (
      <div className="flex items-center gap-2">
        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
        <span>{row.original.email}</span>
      </div>
    ) : (
      <span className="text-gray-400">—</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Роль",
    cell: ({ row }) => (
      <Badge variant={roleColors[row.original.role] as any}>
        {roleLabels[row.original.role]}
      </Badge>
    ),
  },
  {
    accessorKey: "stats",
    header: "Активность",
    cell: ({ row }) => {
      const counts = row.original._count
      return (
        <div className="flex items-center gap-4 text-sm">
          {counts?.orders !== undefined && (
            <div className="flex items-center gap-1">
              <ShoppingBagIcon className="h-4 w-4 text-gray-400" />
              <span>{counts.orders}</span>
            </div>
          )}
          {counts?.chats !== undefined && (
            <div className="flex items-center gap-1">
              <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
              <span>{counts.chats}</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Дата регистрации",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('ru-RU'),
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(row.original)}
        >
          <PencilSquareIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(row.original.id)}
          disabled={deleting === row.original.id}
        >
          {deleting === row.original.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TrashIcon className="h-4 w-4 text-red-600" />
          )}
        </Button>
      </div>
    ),
  },
]