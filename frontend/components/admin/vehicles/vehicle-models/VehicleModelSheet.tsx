"use client"

import { useState, useEffect } from "react"
import { VehicleModel, VehicleBrand, vehicleBrandsApi } from "@/lib/api/vehicles"
import { generateSlug } from "@/lib/utils/slug"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Loader2, Upload, X } from "lucide-react"

interface VehicleModelSheetProps {
  model?: VehicleModel | null
  onSave: () => void
  onCancel: () => void
}

export function VehicleModelSheet({ model, onSave, onCancel }: VehicleModelSheetProps) {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    brandId: "",
    name: "",
    nameCyrillic: "",
    slug: "",
    class: "",
    yearFrom: new Date().getFullYear(),
    yearTo: null as number | null,
    image: "",
    isActive: true,
    sortOrder: 0,
  })

  useEffect(() => {
    loadBrands()
  }, [])

  useEffect(() => {
    if (model) {
      setFormData({
        brandId: model.brandId,
        name: model.name,
        nameCyrillic: model.nameCyrillic,
        slug: model.slug,
        class: model.class,
        yearFrom: model.yearFrom,
        yearTo: model.yearTo ?? null,
        image: model.image || "",
        isActive: model.isActive,
        sortOrder: model.sortOrder,
      })
      setImagePreview(model.image || null)
    }
  }, [model])

  const loadBrands = async () => {
    try {
      const response = await vehicleBrandsApi.getAll({ limit: 1000 })
      setBrands(response.items)
    } catch (error) {
      console.error("Failed to load brands:", error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    if (field === "name" && !model) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value),
      }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, image: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Here we would implement the API call to create/update vehicle model
      // For now, we'll just simulate the API call
      console.log("Vehicle model data:", formData)
      console.log("Image file:", imageFile)
      
      // TODO: Implement actual API calls
      // if (model) {
      //   await vehicleModelsApi.update(model.id, formData, accessToken!)
      // } else {
      //   await vehicleModelsApi.create(formData, accessToken!)
      // }

      onSave()
    } catch (error) {
      console.error("Failed to save vehicle model:", error)
      alert("Ошибка при сохранении модели автомобиля")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <SheetHeader>
        <SheetTitle>
          {model ? "Редактировать модель" : "Добавить модель"}
        </SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 space-y-6 py-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Изображение</Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Image preview"
                    className="w-20 h-12 object-cover border rounded"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm"
                >
                  Выбрать файл
                </label>
              </div>
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brandId">Марка *</Label>
            <select
              id="brandId"
              value={formData.brandId}
              onChange={e => handleInputChange("brandId", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Выберите марку</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name} ({brand.nameCyrillic})
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Название (латиница) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleInputChange("name", e.target.value)}
              placeholder="X5"
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
              placeholder="Икс5"
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
              placeholder="x5"
              required
            />
          </div>

          {/* Class */}
          <div className="space-y-2">
            <Label htmlFor="class">Класс *</Label>
            <Input
              id="class"
              value={formData.class}
              onChange={e => handleInputChange("class", e.target.value)}
              placeholder="SUV"
              required
            />
          </div>

          {/* Years */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearFrom">Год начала выпуска *</Label>
              <Input
                id="yearFrom"
                type="number"
                value={formData.yearFrom}
                onChange={e => handleInputChange("yearFrom", parseInt(e.target.value) || new Date().getFullYear())}
                min="1900"
                max={new Date().getFullYear() + 5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearTo">Год окончания выпуска</Label>
              <Input
                id="yearTo"
                type="number"
                value={formData.yearTo || ""}
                onChange={e => handleInputChange("yearTo", e.target.value ? parseInt(e.target.value) : null)}
                min="1900"
                max={new Date().getFullYear() + 5}
                placeholder="Не указан"
              />
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
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Активна</Label>
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
            {model ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </form>
    </div>
  )
}