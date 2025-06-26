"use client"

import { useState, useEffect } from "react"
import { OrderStatus, CreateOrderStatusDto, orderStatusesApi } from "@/lib/api/order-statuses"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Loader2 } from "lucide-react"

interface OrderStatusSheetProps {
  status?: OrderStatus | null
  onSave: () => void
  onCancel: () => void
}

export function OrderStatusSheet({ status, onSave, onCancel }: OrderStatusSheetProps) {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    color: "#3B82F6",
    description: "",
    isActive: true,
    isFinal: false,
    sortOrder: 0,
  })

  useEffect(() => {
    if (status) {
      setFormData({
        code: status.code,
        name: status.name,
        color: status.color,
        description: status.description || "",
        isActive: status.isActive,
        isFinal: status.isFinal,
        sortOrder: status.sortOrder,
      })
    }
  }, [status])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Убеждаемся, что sortOrder - это число
      const dataToSend = {
        ...formData,
        sortOrder: Number(formData.sortOrder),
      }

      if (status) {
        const { code, ...updateData } = dataToSend
        await orderStatusesApi.update(accessToken!, status.id, updateData)
      } else {
        await orderStatusesApi.create(accessToken!, dataToSend as CreateOrderStatusDto)
      }

      onSave()
    } catch (error: any) {
      console.error("Failed to save order status:", error)
      const errorMessage = error.response?.data?.message || error.message || "Ошибка при сохранении статуса"
      alert(Array.isArray(errorMessage) ? errorMessage.join('\n') : errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const predefinedColors = [
    { name: "Серый", value: "#6B7280" },
    { name: "Синий", value: "#3B82F6" },
    { name: "Зеленый", value: "#10B981" },
    { name: "Желтый", value: "#F59E0B" },
    { name: "Красный", value: "#EF4444" },
    { name: "Фиолетовый", value: "#8B5CF6" },
    { name: "Розовый", value: "#EC4899" },
    { name: "Индиго", value: "#6366F1" },
  ]

  return (
    <div className="h-full flex flex-col">
      <SheetHeader>
        <SheetTitle>
          {status ? "Редактировать статус заказа" : "Добавить статус заказа"}
        </SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4 py-6">
          {/* Code */}
          {!status && (
            <div className="space-y-2">
              <Label htmlFor="code">Код статуса *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={e => handleInputChange("code", e.target.value.toUpperCase())}
                placeholder="PENDING_PAYMENT"
                pattern="^[A-Z_]+$"
                title="Только заглавные буквы и подчеркивания"
                required
              />
              <p className="text-sm text-gray-600">
                Уникальный код для API (только заглавные буквы и _)
              </p>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleInputChange("name", e.target.value)}
              placeholder="Ожидает оплаты"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => handleInputChange("description", e.target.value)}
              placeholder="Заказ ожидает оплаты от клиента"
              rows={3}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Цвет статуса</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={e => handleInputChange("color", e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={formData.color}
                onChange={e => handleInputChange("color", e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                title="HEX формат (#RRGGBB)"
                className="flex-1"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {predefinedColors.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange("color", color.value)}
                  className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Порядок сортировки</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={e => handleInputChange("sortOrder", parseInt(e.target.value) || 0)}
              min="0"
            />
            <p className="text-sm text-gray-600">
              Статусы с меньшим значением отображаются первыми
            </p>
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">Активен</Label>
                <p className="text-sm text-gray-600">
                  Неактивные статусы не доступны для выбора
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={checked => handleInputChange("isActive", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isFinal">Финальный статус</Label>
                <p className="text-sm text-gray-600">
                  Из финального статуса нельзя перейти в другой
                </p>
              </div>
              <Switch
                id="isFinal"
                checked={formData.isFinal}
                onCheckedChange={checked => handleInputChange("isFinal", checked)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {status ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </form>
    </div>
  )
}