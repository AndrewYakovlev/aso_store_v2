"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export interface ProfileFormData {
  firstName?: string
  lastName?: string
  email?: string
  companyName?: string
  companyInn?: string
  defaultShippingAddress?: string
}

interface ProfileFormProps {
  user: {
    id: string
    phone: string
    firstName?: string
    lastName?: string
    email?: string
    companyName?: string
    companyInn?: string
    defaultShippingAddress?: string
    role: string
  }
  onUpdate: (data: ProfileFormData) => Promise<void>
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      companyName: user.companyName || "",
      companyInn: user.companyInn || "",
      defaultShippingAddress: user.defaultShippingAddress || "",
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      // Очищаем пустые строки перед отправкой
      const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value === "" || value === null) {
          return acc
        }
        return { ...acc, [key]: value }
      }, {} as ProfileFormData)

      await onUpdate(cleanedData)
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <CardTitle>Личные данные</CardTitle>
        </div>
        <CardDescription>Обновите информацию вашего профиля</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                {...register("firstName", {
                  minLength: {
                    value: 2,
                    message: "Имя должно содержать минимум 2 символа",
                  },
                })}
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                {...register("lastName", {
                  minLength: {
                    value: 2,
                    message: "Фамилия должна содержать минимум 2 символа",
                  },
                })}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              value={user.phone}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Телефон изменить нельзя
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Неверный формат email",
                },
                validate: value => {
                  // Если поле пустое, валидация проходит успешно
                  if (!value || value.trim() === "") return true
                  // Если поле заполнено, проверяем формат
                  return (
                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ||
                    "Неверный формат email"
                  )
                },
              })}
              disabled={isLoading}
              placeholder="example@mail.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* B2B поля */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium">
              Данные компании (для юридических лиц)
            </h3>

            <div className="space-y-2">
              <Label htmlFor="companyName">Название компании</Label>
              <Input
                id="companyName"
                {...register("companyName")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyInn">ИНН</Label>
              <Input
                id="companyInn"
                {...register("companyInn", {
                  pattern: {
                    value: /^\d{10}$|^\d{12}$/,
                    message: "ИНН должен содержать 10 или 12 цифр",
                  },
                })}
                disabled={isLoading}
              />
              {errors.companyInn && (
                <p className="text-sm text-red-500">
                  {errors.companyInn.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultShippingAddress">
              Адрес доставки по умолчанию
            </Label>
            <Input
              id="defaultShippingAddress"
              {...register("defaultShippingAddress")}
              disabled={isLoading}
              placeholder="г. Бежецк, ул. Ленина, д. 1"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isDirty}
            className="w-full md:w-auto">
            {isLoading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
