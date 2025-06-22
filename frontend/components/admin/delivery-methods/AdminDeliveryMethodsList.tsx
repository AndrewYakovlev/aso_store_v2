"use client"

import { useState, useEffect } from "react"
import { deliveryMethodsApi, DeliveryMethod } from "@/lib/api/delivery-methods"
import { PlusIcon } from "@heroicons/react/24/outline"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Loader2, GripVertical, Edit2, Trash2 } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeliveryMethodSheet } from "./DeliveryMethodSheet"
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
  method: DeliveryMethod
  onEdit: (method: DeliveryMethod) => void
  onDelete: (id: string) => void
  deleting: string | null
}

function SortableItem({ method, onEdit, onDelete, deleting }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: method.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

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

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{method.name}</h3>
          <Badge variant={method.isActive ? "default" : "secondary"}>
            {method.isActive ? 'Активен' : 'Неактивен'}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>Стоимость: {method.price === 0 ? 'Бесплатно' : `${method.price} ₽`}</span>
          {method._count?.orders !== undefined && (
            <span>Заказов: {method._count.orders}</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(method)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(method.id)}
          disabled={deleting === method.id}
        >
          {deleting === method.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-red-600" />
          )}
        </Button>
      </div>
    </div>
  )
}

export function AdminDeliveryMethodsList() {
  const { accessToken } = useAuth()
  const [methods, setMethods] = useState<DeliveryMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<DeliveryMethod | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadMethods()
  }, [])

  const loadMethods = async () => {
    setLoading(true)
    try {
      const data = await deliveryMethodsApi.getAll()
      setMethods(data)
    } catch (error) {
      console.error("Failed to load delivery methods:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот метод доставки?")) {
      return
    }

    setDeleting(id)
    try {
      await deliveryMethodsApi.delete(accessToken!, id)
      await loadMethods()
    } catch (error: any) {
      console.error("Failed to delete delivery method:", error)
      alert(error.response?.data?.message || "Ошибка при удалении метода доставки")
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (method: DeliveryMethod) => {
    setEditingMethod(method)
    setSheetOpen(true)
  }

  const handleCreate = () => {
    setEditingMethod(null)
    setSheetOpen(true)
  }

  const handleSheetClose = () => {
    setSheetOpen(false)
    setEditingMethod(null)
  }

  const handleSheetSave = async () => {
    await loadMethods()
    handleSheetClose()
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = methods.findIndex(m => m.id === active.id)
      const newIndex = methods.findIndex(m => m.id === over.id)

      const newMethods = arrayMove(methods, oldIndex, newIndex)
      setMethods(newMethods)

      // Обновляем порядок сортировки
      setSaving(true)
      try {
        const reorderData = newMethods.map((method, index) => ({
          id: method.id,
          sortOrder: index,
        }))
        await deliveryMethodsApi.reorder(accessToken!, reorderData)
      } catch (error) {
        console.error("Failed to reorder delivery methods:", error)
        // Восстанавливаем предыдущий порядок
        await loadMethods()
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
            <h2 className="text-xl font-semibold">Методы доставки</h2>
            <p className="text-sm text-gray-600 mt-1">
              Управление способами доставки заказов
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Добавить метод
          </button>
        </div>

        {methods.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Методы доставки не созданы
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
                items={methods.map(m => m.id)}
                strategy={verticalListSortingStrategy}
              >
                {methods.map(method => (
                  <SortableItem
                    key={method.id}
                    method={method}
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
          <DeliveryMethodSheet
            method={editingMethod}
            onSave={handleSheetSave}
            onCancel={handleSheetClose}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}