"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/contexts/AuthContext"
import {
  createStoreAddress,
  updateStoreAddress,
  type StoreAddress,
  type CreateStoreAddressData,
} from "@/lib/api/settings"

const addressSchema = z.object({
  type: z.enum(["main", "warehouse", "pickup_point"]),
  name: z.string().optional(),
  country: z.string().min(1, "Укажите страну"),
  city: z.string().min(1, "Укажите город"),
  street: z.string().min(1, "Укажите улицу"),
  building: z.string().min(1, "Укажите номер дома"),
  office: z.string().optional(),
  postalCode: z.string().optional(),
  coordinates: z.string().optional(),
  workingHours: z.string().optional(),
  isActive: z.boolean(),
})

type AddressFormData = z.infer<typeof addressSchema>

interface StoreAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: StoreAddress | null
  onSuccess: () => void
}

export function StoreAddressDialog({
  open,
  onOpenChange,
  address,
  onSuccess,
}: StoreAddressDialogProps) {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: (address?.type as "main" | "warehouse" | "pickup_point") || "main",
      name: address?.name || "",
      country: address?.country || "Россия",
      city: address?.city || "",
      street: address?.street || "",
      building: address?.building || "",
      office: address?.office || "",
      postalCode: address?.postalCode || "",
      coordinates: address?.coordinates || "",
      workingHours: address?.workingHours || "",
      isActive: address?.isActive ?? true,
    },
  })

  const onSubmit = async (data: AddressFormData) => {
    if (!accessToken) return

    setLoading(true)
    try {
      const addressData: CreateStoreAddressData = {
        ...data,
        name: data.name || undefined,
        office: data.office || undefined,
        postalCode: data.postalCode || undefined,
        coordinates: data.coordinates || undefined,
        workingHours: data.workingHours || undefined,
      }

      if (address) {
        await updateStoreAddress(address.id, addressData, accessToken!)
      } else {
        await createStoreAddress(addressData, accessToken!)
      }
      onSuccess()
      form.reset()
    } catch (error) {
      console.error("Failed to save address:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {address ? "Редактировать адрес" : "Добавить адрес"}
          </DialogTitle>
          <DialogDescription>
            {address
              ? "Измените информацию об адресе"
              : "Добавьте новый адрес магазина"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип адреса</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="main">Главный офис</SelectItem>
                        <SelectItem value="warehouse">Склад</SelectItem>
                        <SelectItem value="pickup_point">
                          Пункт самовывоза
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название (необязательно)</FormLabel>
                    <FormControl>
                      <Input placeholder="Главный офис" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Страна</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Город</FormLabel>
                    <FormControl>
                      <Input placeholder="Бежецк" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Улица</FormLabel>
                  <FormControl>
                    <Input placeholder="ул. Ленина" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дом</FormLabel>
                    <FormControl>
                      <Input placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="office"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Офис/квартира</FormLabel>
                    <FormControl>
                      <Input placeholder="201" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Индекс</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="workingHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Часы работы</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Пн-Пт 9:00-18:00, Сб 10:00-16:00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GPS координаты (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"lat": 55.7558, "lng": 37.6173}'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Введите координаты в формате JSON для отображения на карте
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Активен</FormLabel>
                    <FormDescription>
                      Неактивные адреса не будут показываться клиентам
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
