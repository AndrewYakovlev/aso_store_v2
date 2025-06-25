"use client"

import { useState, useEffect } from "react"
import { User, Role, CreateUserDto, UpdateUserDto, usersApi } from "@/lib/api/users"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Loader2 } from "lucide-react"
import { formatPhoneForDisplay, normalizePhone } from "@/lib/utils/phone"

interface UserSheetProps {
  user?: User | null
  onSave: () => void
  onCancel: () => void
}

export function UserSheet({ user, onSave, onCancel }: UserSheetProps) {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: "",
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    companyName: "",
    companyInn: "",
    role: Role.CUSTOMER,
  })

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName || "",
        middleName: user.middleName || "",
        email: user.email || "",
        companyName: user.companyName || "",
        companyInn: user.companyInn || "",
        role: user.role,
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneForDisplay(e.target.value)
    handleInputChange("phone", formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Преобразуем пустые строки в undefined
      const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value === '') {
          acc[key] = undefined;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const submitData = {
        ...cleanedData,
        phone: normalizePhone(formData.phone), // Нормализуем телефон перед отправкой
      }

      if (user) {
        await usersApi.update(accessToken!, user.id, submitData)
      } else {
        await usersApi.create(accessToken!, submitData as CreateUserDto)
      }

      onSave()
    } catch (error: any) {
      console.error("Failed to save user:", error)
      alert(error.response?.data?.message || "Ошибка при сохранении пользователя")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <SheetHeader>
        <SheetTitle>
          {user ? "Редактировать пользователя" : "Добавить пользователя"}
        </SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4 py-6">
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="+7 (999) 999-99-99"
              required
            />
          </div>

          {/* Names */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={e => handleInputChange("lastName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={e => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Отчество</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={e => handleInputChange("middleName", e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleInputChange("email", e.target.value)}
            />
          </div>

          {/* Company */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Компания</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={e => handleInputChange("companyName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyInn">ИНН</Label>
              <Input
                id="companyInn"
                value={formData.companyInn}
                onChange={e => handleInputChange("companyInn", e.target.value)}
                pattern="[0-9]{10}|[0-9]{12}"
                title="ИНН должен содержать 10 или 12 цифр"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Роль *</Label>
            <select
              id="role"
              value={formData.role}
              onChange={e => handleInputChange("role", e.target.value as Role)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              <option value={Role.CUSTOMER}>Покупатель</option>
              <option value={Role.MANAGER}>Менеджер</option>
              <option value={Role.ADMIN}>Администратор</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {user ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </form>
    </div>
  )
}