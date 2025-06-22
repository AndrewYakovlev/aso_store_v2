"use client"

import { useState, useEffect } from "react"
import { DeliveryMethod, CreateDeliveryMethodDto, deliveryMethodsApi } from "@/lib/api/delivery-methods"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Loader2 } from "lucide-react"

interface DeliveryMethodSheetProps {
  method?: DeliveryMethod | null
  onSave: () => void
  onCancel: () => void
}

export function DeliveryMethodSheet({ method, onSave, onCancel }: DeliveryMethodSheetProps) {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    isActive: true,
    sortOrder: 0,
  })

  useEffect(() => {
    if (method) {
      setFormData({
        name: method.name,
        description: method.description,
        price: method.price,
        isActive: method.isActive,
        sortOrder: method.sortOrder,
      })
    }
  }, [method])

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
      if (method) {
        await deliveryMethodsApi.update(accessToken!, method.id, formData)
      } else {
        await deliveryMethodsApi.create(accessToken!, formData as CreateDeliveryMethodDto)
      }

      onSave()
    } catch (error: any) {
      console.error("Failed to save delivery method:", error)
      alert(error.response?.data?.message || "Ошибка при сохранении метода доставки")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <SheetHeader>
        <SheetTitle>
          {method ? "Редактировать метод доставки" : "Добавить метод доставки"}
        </SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4 py-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleInputChange("name", e.target.value)}
              placeholder="Самовывоз"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => handleInputChange("description", e.target.value)}
              placeholder="Самовывоз со склада по адресу..."
              rows={3}
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Стоимость *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={e => handleInputChange("price", parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              required
            />
            <p className="text-sm text-gray-600">
              Укажите 0 для бесплатной доставки
            </p>
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
              Методы с меньшим значением отображаются первыми
            </p>
          </div>

          {/* Active */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Активен</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={checked => handleInputChange("isActive", checked)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {method ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </form>
    </div>
  )
}