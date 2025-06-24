"use client"

import { useState, useRef, DragEvent } from "react"
import { CreateProductOfferDto } from "@/types/chat"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Upload,
  X,
  Calendar,
  GripVertical,
  Image as ImageIcon,
} from "lucide-react"
import { apiRequest } from "@/lib/api/client"
import { useToast } from "@/components/ui/use-toast"
import { getImageUrl } from "@/lib/utils/image"

interface ProductOfferFormProps {
  onSubmit: (data: CreateProductOfferDto) => Promise<void>
  onCancel: () => void
  accessToken: string
}

interface ImageItem {
  url: string
  preview: string
}

export function ProductOfferForm({
  onSubmit,
  onCancel,
  accessToken,
}: ProductOfferFormProps) {
  const [data, setData] = useState<CreateProductOfferDto>({
    name: "",
    description: "",
    price: 0,
    images: [],
  })
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)

    // Check if we exceed 10 images total
    if (images.length + fileArray.length > 10) {
      toast({
        title: "Слишком много изображений",
        description: "Максимум 10 изображений",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    const uploadedImages: ImageItem[] = []

    for (const file of fileArray) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Файл слишком большой",
          description: `${file.name} превышает 5MB`,
          variant: "destructive",
        })
        continue
      }

      const formData = new FormData()
      formData.append("file", file)

      try {
        const response = await apiRequest<{ url: string }>("/uploads/image", {
          method: "POST",
          body: formData,
          token: accessToken,
        })

        uploadedImages.push({
          url: response.url,
          preview: URL.createObjectURL(file),
        })
      } catch (error) {
        toast({
          title: "Ошибка загрузки",
          description: `Не удалось загрузить ${file.name}`,
          variant: "destructive",
        })
      }
    }

    if (uploadedImages.length > 0) {
      const newImages = [...images, ...uploadedImages]
      setImages(newImages)
      setData({ ...data, images: newImages.map(img => img.url) })
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleImageUpload(files)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that only one of isOriginal or isAnalog is set
    if (data.isOriginal && data.isAnalog) {
      toast({
        title: "Ошибка",
        description: "Товар не может быть одновременно оригиналом и аналогом",
        variant: "destructive",
      })
      return
    }

    await onSubmit(data)
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    setData({ ...data, images: newImages.map(img => img.url) })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]

    // Remove dragged item
    newImages.splice(draggedIndex, 1)

    // Insert at new position
    const adjustedIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newImages.splice(adjustedIndex, 0, draggedImage)

    setImages(newImages)
    setData({ ...data, images: newImages.map(img => img.url) })

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Название товара *</Label>
        <Input
          id="name"
          value={data.name}
          onChange={e => setData({ ...data, name: e.target.value })}
          placeholder="Тормозные колодки передние"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={data.description || ""}
          onChange={e => setData({ ...data, description: e.target.value })}
          placeholder="Дополнительная информация о товаре"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Цена *</Label>
          <Input
            id="price"
            type="number"
            value={data.price || ""}
            onChange={e => setData({ ...data, price: Number(e.target.value) })}
            placeholder="0"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <Label htmlFor="oldPrice">Старая цена</Label>
          <Input
            id="oldPrice"
            type="number"
            value={data.oldPrice || ""}
            onChange={e =>
              setData({
                ...data,
                oldPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="deliveryDays">Срок доставки (дней)</Label>
        <Input
          id="deliveryDays"
          type="number"
          value={data.deliveryDays || ""}
          onChange={e =>
            setData({
              ...data,
              deliveryDays: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="1-3"
          min="0"
        />
      </div>

      <div className="space-y-2">
        <Label>Тип товара</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.isOriginal || false}
              onChange={e =>
                setData({
                  ...data,
                  isOriginal: e.target.checked,
                  isAnalog: e.target.checked ? false : data.isAnalog, // Uncheck analog if original is checked
                })
              }
              className="rounded"
            />
            <span>Оригинал</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.isAnalog || false}
              onChange={e =>
                setData({
                  ...data,
                  isAnalog: e.target.checked,
                  isOriginal: e.target.checked ? false : data.isOriginal, // Uncheck original if analog is checked
                })
              }
              className="rounded"
            />
            <span>Аналог</span>
          </label>
        </div>
      </div>

      <div>
        <Label>Изображения товара (макс. 10)</Label>
        <div className="mt-2 space-y-4">
          {/* Image grid with drag-n-drop */}
          {images.length > 0 && (
            <div className="flex gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative group h-36 w-36 cursor-move ${
                    dragOverIndex === index ? "ring-2 ring-blue-500" : ""
                  } ${draggedIndex === index ? "opacity-50" : ""}`}>
                  <img
                    src={getImageUrl(image.url)}
                    alt={`Preview ${index + 1}`}
                    className="h-36 w-36 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 bg-opacity-50 group-hover:bg-opacity-70 transition-opacity rounded-lg" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    {index + 1}
                  </div>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                      Основное
                    </div>
                  )}
                  <GripVertical className="absolute top-1 right-1 h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {images.length < 10 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg hover:border-gray-400 disabled:opacity-50">
              <Upload className="h-5 w-5" />
              {uploading
                ? "Загрузка..."
                : `Загрузить изображения (${images.length}/10)`}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />

          <p className="text-sm text-gray-500">
            Перетащите изображения для изменения порядка. Первое изображение
            будет основным.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="expiresAt">Срок действия предложения</Label>
        <Input
          id="expiresAt"
          type="datetime-local"
          value={
            data.expiresAt
              ? new Date(data.expiresAt).toISOString().slice(0, 16)
              : ""
          }
          onChange={e =>
            setData({
              ...data,
              expiresAt: e.target.value
                ? new Date(e.target.value).toISOString()
                : undefined,
            })
          }
          min={new Date().toISOString().slice(0, 16)}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Отправить предложение
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  )
}
