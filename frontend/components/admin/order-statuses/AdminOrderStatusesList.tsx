"use client"

import { useState, useEffect } from "react"
import { orderStatusesApi, OrderStatus } from "@/lib/api/order-statuses"
import { PlusIcon } from "@heroicons/react/24/outline"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Loader2, GripVertical, Edit2, Trash2, ShieldCheck, ShieldOff } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderStatusSheet } from "./OrderStatusSheet"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableItemProps {
  status: OrderStatus
  onEdit: (status: OrderStatus) => void
  onDelete: (id: string) => void
  deleting: string | null
}

function SortableItem({ status, onEdit, onDelete, deleting }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: status.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isSystemStatus = ['NEW', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status.code)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-4 rounded-lg border flex items-center gap-4"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div
        className="w-4 h-4 rounded-full border-2"
        style={{ 
          backgroundColor: status.color,
          borderColor: status.color 
        }}
      />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{status.name}</h3>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{status.code}</code>
          {isSystemStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Системный
            </Badge>
          )}
          {status.isFinal && (
            <Badge variant="destructive">Финальный</Badge>
          )}
          {!status.isActive && (
            <Badge variant="outline">Неактивен</Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{status.description}</p>
        {status._count?.orders !== undefined && (
          <p className="text-sm text-gray-500 mt-2">Заказов: {status._count.orders}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(status)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(status.id)}
          disabled={deleting === status.id || isSystemStatus}
          title={isSystemStatus ? "Системный статус нельзя удалить" : "Удалить"}
        >
          {deleting === status.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className={`h-4 w-4 ${isSystemStatus ? 'text-gray-400' : 'text-red-600'}`} />
          )}
        </Button>
      </div>
    </div>
  )
}

export function AdminOrderStatusesList() {
  const { accessToken } = useAuth()
  const [statuses, setStatuses] = useState<OrderStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<OrderStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadStatuses()
  }, [])

  const loadStatuses = async () => {
    setLoading(true)
    try {
      const data = await orderStatusesApi.getAll()
      setStatuses(data)
    } catch (error) {
      console.error("Failed to load order statuses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот статус?")) {
      return
    }

    setDeleting(id)
    try {
      await orderStatusesApi.delete(accessToken!, id)
      await loadStatuses()
    } catch (error: any) {
      console.error("Failed to delete order status:", error)
      alert(error.response?.data?.message || "Ошибка при удалении статуса")
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (status: OrderStatus) => {
    setEditingStatus(status)
    setSheetOpen(true)
  }

  const handleCreate = () => {
    setEditingStatus(null)
    setSheetOpen(true)
  }

  const handleSheetClose = () => {
    setSheetOpen(false)
    setEditingStatus(null)
  }

  const handleSheetSave = async () => {
    await loadStatuses()
    handleSheetClose()
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = statuses.findIndex(s => s.id === active.id)
      const newIndex = statuses.findIndex(s => s.id === over.id)

      const newStatuses = arrayMove(statuses, oldIndex, newIndex)
      setStatuses(newStatuses)

      // Обновляем порядок сортировки
      setSaving(true)
      try {
        const reorderData = newStatuses.map((status, index) => ({
          id: status.id,
          sortOrder: index,
        }))
        await orderStatusesApi.reorder(accessToken!, reorderData)
      } catch (error) {
        console.error("Failed to reorder order statuses:", error)
        // Восстанавливаем предыдущий порядок
        await loadStatuses()
      } finally {
        setSaving(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Статусы заказов</h2>
            <p className="text-sm text-gray-600 mt-1">
              Управление статусами и этапами выполнения заказов
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Добавить статус
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <ShieldOff className="h-5 w-5 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Системные статусы</p>
              <p>Статусы NEW, PROCESSING, SHIPPED, DELIVERED и CANCELLED являются системными и не могут быть удалены. Вы можете изменить их название, описание и внешний вид.</p>
            </div>
          </div>
        </div>

        {statuses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Статусы заказов не найдены
          </div>
        ) : (
          <div className="space-y-2">
            {saving && (
              <div className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Сохранение порядка...
              </div>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={statuses.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {statuses.map(status => (
                  <SortableItem
                    key={status.id}
                    status={status}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    deleting={deleting}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-1/3">
          <OrderStatusSheet
            status={editingStatus}
            onSave={handleSheetSave}
            onCancel={handleSheetClose}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}