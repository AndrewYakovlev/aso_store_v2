"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Attribute, AttributeType } from "@/lib/api/attributes";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface AttributesColumnsProps {
  onEdit: (attribute: Attribute) => void;
  onDelete: (id: string) => void;
  deleting: string | null;
}

const getAttributeTypeBadge = (type: AttributeType) => {
  const variants: Record<AttributeType, string> = {
    [AttributeType.TEXT]: "default",
    [AttributeType.NUMBER]: "secondary", 
    [AttributeType.COLOR]: "outline",
    [AttributeType.SELECT_ONE]: "destructive",
    [AttributeType.SELECT_MANY]: "destructive",
  };

  const labels: Record<AttributeType, string> = {
    [AttributeType.TEXT]: "Текст",
    [AttributeType.NUMBER]: "Число",
    [AttributeType.COLOR]: "Цвет",
    [AttributeType.SELECT_ONE]: "Выбор",
    [AttributeType.SELECT_MANY]: "Множ. выбор",
  };

  return (
    <Badge variant={variants[type] as any}>
      {labels[type]}
    </Badge>
  );
};

export const createAttributesColumns = ({
  onEdit,
  onDelete,
  deleting,
}: AttributesColumnsProps): ColumnDef<Attribute>[] => [
  {
    accessorKey: "code",
    header: "Код",
    cell: ({ row }) => {
      const attribute = row.original;
      return (
        <div>
          <div className="font-mono text-sm">{attribute.code}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Название",
    cell: ({ row }) => {
      const attribute = row.original;
      return (
        <div>
          <div className="font-medium">{attribute.name}</div>
          {attribute.unit && (
            <div className="text-sm text-muted-foreground">Единица: {attribute.unit}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Тип",
    cell: ({ row }) => {
      const attribute = row.original;
      return getAttributeTypeBadge(attribute.type);
    },
  },
  {
    accessorKey: "options",
    header: "Опции",
    cell: ({ row }) => {
      const attribute = row.original;
      if (!attribute.options || attribute.options.length === 0) {
        return "—";
      }
      return (
        <div className="text-sm">
          {attribute.options.slice(0, 3).map(option => option.value).join(", ")}
          {attribute.options.length > 3 && (
            <span className="text-muted-foreground"> и еще {attribute.options.length - 3}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "categories",
    header: "Категории",
    cell: ({ row }) => {
      const attribute = row.original;
      const categoryCount = attribute.categoryAttributes?.length || 0;
      
      if (categoryCount === 0) {
        return <span className="text-muted-foreground">—</span>;
      }
      
      return (
        <div className="text-sm">
          <span className="font-medium">{categoryCount}</span>
          <span className="text-muted-foreground ml-1">
            {categoryCount === 1 ? "категория" : 
             categoryCount < 5 ? "категории" : "категорий"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "properties",
    header: "Свойства",
    cell: ({ row }) => {
      const attribute = row.original;
      return (
        <div className="flex flex-wrap gap-1">
          {attribute.isRequired && (
            <Badge variant="outline" className="text-xs">
              Обязательный
            </Badge>
          )}
          {attribute.isFilterable && (
            <Badge variant="outline" className="text-xs">
              Фильтр
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "sortOrder",
    header: "Порядок",
    cell: ({ row }) => {
      const attribute = row.original;
      return (
        <span className="text-sm text-muted-foreground">
          {attribute.sortOrder}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const attribute = row.original;
      const isDeleting = deleting === attribute.id;

      return (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(attribute);
            }}
            className="text-blue-600 hover:text-blue-900"
            title="Редактировать"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(attribute.id);
            }}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
            title="Удалить"
          >
            {isDeleting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      );
    },
  },
];