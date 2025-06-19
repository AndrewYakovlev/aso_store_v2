"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BrandWithProductsCount } from "@/lib/api/brands";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

interface BrandsColumnsProps {
  onEdit: (brand: BrandWithProductsCount) => void;
  onDelete: (id: string) => void;
  deleting: string | null;
}

export const createBrandsColumns = ({
  onEdit,
  onDelete,
  deleting,
}: BrandsColumnsProps): ColumnDef<BrandWithProductsCount>[] => [
  {
    accessorKey: "logo",
    header: "Логотип",
    cell: ({ row }) => {
      const brand = row.original;
      return brand.logo ? (
        <img
          src={brand.logo}
          alt={brand.name}
          className="h-10 w-10 object-contain"
        />
      ) : (
        <div className="h-10 w-10 bg-gray-200 rounded"></div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => {
      const brand = row.original;
      return (
        <div>
          <div className="font-medium">{brand.name}</div>
          <div className="text-sm text-muted-foreground">{brand.slug}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "country",
    header: "Страна",
    cell: ({ row }) => {
      const brand = row.original;
      return brand.country || "—";
    },
  },
  {
    accessorKey: "productsCount",
    header: "Товаров",
    cell: ({ row }) => {
      const brand = row.original;
      return brand.productsCount || 0;
    },
  },
  {
    accessorKey: "isActive",
    header: "Статус",
    cell: ({ row }) => {
      const brand = row.original;
      return (
        <Badge variant={brand.isActive ? "default" : "secondary"}>
          {brand.isActive ? "Активен" : "Неактивен"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const brand = row.original;
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(brand);
            }}
            className="text-blue-600 hover:text-blue-900"
            title="Редактировать"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(brand.id);
            }}
            disabled={deleting === brand.id}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
            title="Удалить"
          >
            {deleting === brand.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      );
    },
  },
];