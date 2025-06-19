"use client";

import { ColumnDef } from "@tanstack/react-table";
import { VehicleBrandWithCount } from "@/lib/api/vehicles";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, EyeIcon } from "@heroicons/react/24/outline";

interface VehicleBrandsColumnsProps {
  onEdit: (brand: VehicleBrandWithCount) => void;
  onViewModels: (brand: VehicleBrandWithCount) => void;
}

export const createVehicleBrandsColumns = ({
  onEdit,
  onViewModels,
}: VehicleBrandsColumnsProps): ColumnDef<VehicleBrandWithCount>[] => [
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
        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
          {brand.name.charAt(0)}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Марка",
    cell: ({ row }) => {
      const brand = row.original;
      return (
        <div>
          <div className="font-medium">{brand.name}</div>
          <div className="text-sm text-muted-foreground">{brand.nameCyrillic}</div>
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
    accessorKey: "modelsCount",
    header: "Моделей",
    cell: ({ row }) => {
      const brand = row.original;
      return (
        <div className="flex items-center gap-2">
          <span>{brand.modelsCount || 0}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewModels(brand);
            }}
            className="text-blue-600 hover:text-blue-900 text-sm"
            title="Просмотреть модели"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
  {
    accessorKey: "popular",
    header: "Популярная",
    cell: ({ row }) => {
      const brand = row.original;
      return (
        <Badge variant={brand.popular ? "default" : "secondary"}>
          {brand.popular ? "Да" : "Нет"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Статус",
    cell: ({ row }) => {
      const brand = row.original;
      return (
        <Badge variant={brand.isActive ? "default" : "secondary"}>
          {brand.isActive ? "Активна" : "Неактивна"}
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
        </div>
      );
    },
  },
];