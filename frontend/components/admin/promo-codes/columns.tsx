"use client"

import { ColumnDef } from "@tanstack/react-table"
import { PromoCode } from "@/lib/api/promo-codes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface ColumnsProps {
  onEdit: (promoCode: PromoCode) => void
  onDelete: (id: string) => void
  deleting?: string | null
}

export const createPromoCodesColumns = ({ onEdit, onDelete, deleting }: ColumnsProps): ColumnDef<PromoCode>[] => [
  {
    accessorKey: "code",
    header: "Код",
    cell: ({ row }) => (
      <span className="font-mono font-medium">{row.original.code}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Описание",
    cell: ({ row }) => row.original.description || <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "discount",
    header: "Скидка",
    cell: ({ row }) => {
      const promo = row.original;
      return (
        <div>
          {promo.discountType === 'PERCENTAGE' 
            ? `${promo.discountValue}%`
            : formatPrice(promo.discountValue)
          }
        </div>
      );
    },
  },
  {
    accessorKey: "minOrderAmount",
    header: "Мин. сумма",
    cell: ({ row }) => row.original.minOrderAmount 
      ? formatPrice(row.original.minOrderAmount)
      : <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "usage",
    header: "Использование",
    cell: ({ row }) => {
      const promo = row.original;
      const current = promo.currentUses || 0;
      const max = promo.maxUsesTotal;
      
      return (
        <div className="text-sm">
          {max ? `${current} / ${max}` : current}
        </div>
      );
    },
  },
  {
    accessorKey: "validity",
    header: "Срок действия",
    cell: ({ row }) => {
      const promo = row.original;
      const now = new Date();
      const validFrom = new Date(promo.validFrom);
      const validUntil = promo.validUntil ? new Date(promo.validUntil) : null;
      
      let status = 'active';
      let text = '';
      
      if (now < validFrom) {
        status = 'pending';
        text = `С ${format(validFrom, 'dd.MM.yyyy', { locale: ru })}`;
      } else if (validUntil && now > validUntil) {
        status = 'expired';
        text = `Истёк ${format(validUntil, 'dd.MM.yyyy', { locale: ru })}`;
      } else if (validUntil) {
        text = `До ${format(validUntil, 'dd.MM.yyyy', { locale: ru })}`;
      } else {
        text = 'Бессрочно';
      }
      
      return (
        <div className="text-sm">
          <span className={
            status === 'expired' ? 'text-red-600' :
            status === 'pending' ? 'text-yellow-600' :
            ''
          }>
            {text}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Статус",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? 'default' : 'destructive'}>
        {row.original.isActive ? 'Активен' : 'Неактивен'}
      </Badge>
    ),
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