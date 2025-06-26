"use client"

import { useState, useEffect } from "react"
import { PaymentMethod, CreatePaymentMethodDto, paymentMethodsApi } from "@/lib/api/payment-methods"
import { useAuth } from "@/lib/contexts/AuthContext"
import { generateSlug } from "@/lib/utils/slug"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Loader2 } from "lucide-react"

interface PaymentMethodSheetProps {
  method?: PaymentMethod | null
  onSave: () => void
  onCancel: () => void
}

export function PaymentMethodSheet({ method, onSave, onCancel }: PaymentMethodSheetProps) {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
    sortOrder: 0,
  })

  useEffect(() => {
    if (method) {
      setFormData({
        code: method.code,
        name: method.name,
        description: method.description,
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

    // Автоматически генерировать код при изменении названия для нового метода
    if (field === "name" && !method) {
      setFormData(prev => ({
        ...prev,
        code: generateSlug(value),
      }))
    }
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

      if (method) {
        // При обновлении не отправляем код
        const { code, ...updateData } = dataToSend
        await paymentMethodsApi.update(accessToken!, method.id, updateData)
      } else {
        await paymentMethodsApi.create(accessToken!, dataToSend as CreatePaymentMethodDto)
      }

      onSave()
    } catch (error: any) {
      console.error("Failed to save payment method:", error)
      const errorMessage = error.response?.data?.message || error.message || "Ошибка при сохранении метода оплаты"
      alert(Array.isArray(errorMessage) ? errorMessage.join('\n') : errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <SheetHeader>
        <SheetTitle>
          {method ? "Редактировать метод оплаты" : "Добавить метод оплаты"}
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
              placeholder="Наличными при получении"
              required
            />
          </div>

          {/* Code - только для новых методов */}
          {!method && (
            <div className="space-y-2">
              <Label htmlFor="code">Код метода *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={e => handleInputChange("code", e.target.value)}
                placeholder="cash"
                required
              />
              <p className="text-sm text-gray-600">
                Уникальный код для идентификации метода. Генерируется автоматически из названия.
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => handleInputChange("description", e.target.value)}
              placeholder="Оплата наличными курьеру или в пункте выдачи"
              rows={3}
              required
            />
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