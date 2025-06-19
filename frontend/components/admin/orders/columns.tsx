"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/lib/api/orders";
import { Badge } from "@/components/ui/badge";
import { EyeIcon } from "@heroicons/react/24/outline";

interface OrdersColumnsProps {
  onView: (order: Order) => void;
}

export const createOrdersColumns = ({
  onView,
}: OrdersColumnsProps): ColumnDef<Order>[] => [
  {
    accessorKey: "orderNumber",
    header: "Номер заказа",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div>
          <div className="font-medium">#{order.orderNumber}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: "Клиент",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div>
          <div className="font-medium">{order.customerName}</div>
          <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const order = row.original;
      const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
          case 'new':
          case 'новый':
            return 'default';
          case 'processing':
          case 'в обработке':
            return 'secondary';
          case 'shipped':
          case 'отправлен':
            return 'outline';
          case 'delivered':
          case 'доставлен':
            return 'default';
          case 'cancelled':
          case 'отменен':
            return 'destructive';
          default:
            return 'secondary';
        }
      };

      return (
        <Badge variant={getStatusVariant(order.status.name)}>
          {order.status.name}
        </Badge>
      );
    },
  },
  {
    accessorKey: "grandTotal",
    header: "Сумма",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div>
          <div className="font-medium">{order.grandTotal.toLocaleString()} ₽</div>
          <div className="text-sm text-muted-foreground">
            {order.items.length} {order.items.length === 1 ? 'товар' : 'товаров'}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "deliveryMethod",
    header: "Доставка",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div>
          <div className="text-sm">{order.deliveryMethod.name}</div>
          {order.deliveryAmount > 0 && (
            <div className="text-sm text-muted-foreground">
              {order.deliveryAmount.toLocaleString()} ₽
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Оплата",
    cell: ({ row }) => {
      const order = row.original;
      return order.paymentMethod.name;
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(order);
          }}
          className="text-blue-600 hover:text-blue-900"
          title="Просмотреть заказ"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      );
    },
  },
];