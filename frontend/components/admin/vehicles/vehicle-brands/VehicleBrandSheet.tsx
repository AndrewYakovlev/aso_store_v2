"use client"

import { useState, useEffect } from "react"
import { VehicleBrand } from "@/lib/api/vehicles"
import { generateSlug } from "@/lib/utils/slug"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Loader2, Upload, X } from "lucide-react"

interface VehicleBrandSheetProps {
  brand?: VehicleBrand | null
  onSave: () => void
  onCancel: () => void
}

export function VehicleBrandSheet({ brand, onSave, onCancel }: VehicleBrandSheetProps) {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    nameCyrillic: "",
    slug: "",
    country: "",
    logo: "",
    popular: false,
    isActive: true,
    sortOrder: 0,
  })

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        nameCyrillic: brand.nameCyrillic,
        slug: brand.slug,
        country: brand.country || "",
        logo: brand.logo || "",
        popular: brand.popular,
        isActive: brand.isActive,
        sortOrder: brand.sortOrder,
      })
      setLogoPreview(brand.logo || null)
    }
  }, [brand])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    if (field === "name" && !brand) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value),
      }))
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setFormData(prev => ({ ...prev, logo: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Here we would implement the API call to create/update vehicle brand
      // For now, we'll just simulate the API call
      console.log("Vehicle brand data:", formData)
      console.log("Logo file:", logoFile)
      
      // TODO: Implement actual API calls
      // if (brand) {
      //   await vehicleBrandsApi.update(brand.id, formData, accessToken!)
      // } else {
      //   await vehicleBrandsApi.create(formData, accessToken!)
      // }

      onSave()
    } catch (error) {
      console.error("Failed to save vehicle brand:", error)
      alert("Ошибка при сохранении марки автомобиля")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <SheetHeader>
        <SheetTitle>
          {brand ? "Редактировать марку" : "Добавить марку"}
        </SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 space-y-6 py-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Логотип</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain border rounded"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm"
                >
                  Выбрать файл
                </label>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Название (латиница) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleInputChange("name", e.target.value)}
              placeholder="BMW"
              required
            />
          </div>

          {/* Name Cyrillic */}
          <div className="space-y-2">
            <Label htmlFor="nameCyrillic">Название (кириллица) *</Label>
            <Input
              id="nameCyrillic"
              value={formData.nameCyrillic}
              onChange={e => handleInputChange("nameCyrillic", e.target.value)}
              placeholder="БМВ"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL (slug) *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={e => handleInputChange("slug", e.target.value)}
              placeholder="bmw"
              required
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Страна</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={e => handleInputChange("country", e.target.value)}
              placeholder="Германия"
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
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="popular">Популярная марка</Label>
              <Switch
                id="popular"
                checked={formData.popular}
                onCheckedChange={checked => handleInputChange("popular", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Активна</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={checked => handleInputChange("isActive", checked)}
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
            {brand ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </form>
    </div>
  )
}