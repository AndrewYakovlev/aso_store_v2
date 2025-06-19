"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Category } from "@/lib/api/categories";
import { Badge } from "@/components/ui/badge";
import { 
  PencilIcon, 
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  FolderOpenIcon
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  level?: number;
}

interface CategoriesColumnsProps {
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  deleting: string | null;
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
}

export const createCategoriesColumns = ({
  onEdit,
  onDelete,
  deleting,
  expandedIds,
  toggleExpanded,
}: CategoriesColumnsProps): ColumnDef<CategoryWithChildren>[] => [
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => {
      const category = row.original;
      const level = category.level || 0;
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedIds.has(category.id);

      return (
        <div 
          className="flex items-center"
          style={{ paddingLeft: `${level * 24}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(category.id);
              }}
              className="mr-2 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          <div className="flex items-center">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpenIcon className="h-5 w-5 text-blue-500 mr-2" />
              ) : (
                <FolderIcon className="h-5 w-5 text-blue-500 mr-2" />
              )
            ) : (
              <div className="h-5 w-5 mr-2" />
            )}
            <div>
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-muted-foreground">{category.slug}</div>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "productCount",
    header: "Товаров",
    cell: ({ row }) => {
      const category = row.original;
      return category.productCount || 0;
    },
  },
  {
    accessorKey: "sortOrder",
    header: "Порядок",
    cell: ({ row }) => {
      const category = row.original;
      return category.sortOrder;
    },
  },
  {
    accessorKey: "isActive",
    header: "Статус",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <Badge variant={category.isActive ? "default" : "secondary"}>
          {category.isActive ? "Активна" : "Неактивна"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
            className="text-blue-600 hover:text-blue-900"
            title="Редактировать"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category.id);
            }}
            disabled={deleting === category.id}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
            title="Удалить"
          >
            {deleting === category.id ? (
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