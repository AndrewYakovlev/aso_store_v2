"use client";

import { ColumnDef } from "@tanstack/react-table";
import { VehicleModel } from "@/lib/api/vehicles";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getImageUrl } from "@/lib/utils/image";

interface VehicleModelsColumnsProps {
  onEdit: (model: VehicleModel) => void;
  onDelete: (model: VehicleModel) => void;
}

export const createVehicleModelsColumns = ({
  onEdit,
  onDelete,
}: VehicleModelsColumnsProps): ColumnDef<VehicleModel>[] => [
  {
    accessorKey: "image",
    header: "Изображение",
    cell: ({ row }) => {
      const model = row.original;
      return model.image ? (
        <img
          src={getImageUrl(model.image)}
          alt={model.name}
          className="h-10 w-16 object-cover rounded"
        />
      ) : (
        <div className="h-10 w-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
          {model.name.charAt(0)}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Модель",
    cell: ({ row }) => {
      const model = row.original;
      return (
        <div>
          <div className="font-medium">{model.name}</div>
          <div className="text-sm text-muted-foreground">{model.nameCyrillic}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "brand",
    header: "Марка",
    cell: ({ row }) => {
      const model = row.original;
      return model.brand ? (
        <div>
          <div className="font-medium">{model.brand.name}</div>
          <div className="text-sm text-muted-foreground">{model.brand.nameCyrillic}</div>
        </div>
      ) : (
        "—"
      );
    },
  },
  {
    accessorKey: "class",
    header: "Класс",
    cell: ({ row }) => {
      const model = row.original;
      return (
        <Badge variant="outline">
          {model.class}
        </Badge>
      );
    },
  },
  {
    accessorKey: "years",
    header: "Годы выпуска",
    cell: ({ row }) => {
      const model = row.original;
      return (
        <span className="text-sm">
          {model.yearFrom}
          {model.yearTo ? ` - ${model.yearTo}` : " - н.в."}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Статус",
    cell: ({ row }) => {
      const model = row.original;
      return (
        <Badge variant={model.isActive ? "default" : "secondary"}>
          {model.isActive ? "Активна" : "Неактивна"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const model = row.original;
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(model);
            }}
            className="text-blue-600 hover:text-blue-900"
            title="Редактировать"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(model);
            }}
            className="text-red-600 hover:text-red-900"
            title="Удалить"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];