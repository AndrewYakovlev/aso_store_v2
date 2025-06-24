"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  GripVertical,
  Star,
} from "lucide-react"
import { useAuth } from "@/lib/contexts/AuthContext"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { productImagesApi, ProductImage } from "@/lib/api/product-images"
import { getImageUrl } from "@/lib/utils/image"

interface ProductImagesManagerProps {
  productId?: string
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
}

interface SortableImageProps {
  image: ProductImage
  onRemove: () => void
  onSetMain: () => void
  onUpdateAlt: (alt: string) => void
}

function SortableImage({
  image,
  onRemove,
  onSetMain,
  onUpdateAlt,
}: SortableImageProps) {
  const [showAltInput, setShowAltInput] = useState(false)
  const [altText, setAltText] = useState(image.alt || "")

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleAltSave = () => {
    onUpdateAlt(altText)
    setShowAltInput(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white border rounded-lg overflow-hidden ${isDragging ? "shadow-lg" : ""}`}>
      <div className="relative">
        <img
          src={image.url.startsWith('blob:') ? image.url : getImageUrl(image.url)}
          alt={image.alt || `Изображение товара`}
          className="w-full h-40 object-cover"
        />

        {image.isMain && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Star className="h-3 w-3" />
            Главное
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-2 bg-white rounded-lg shadow-lg hover:shadow-xl cursor-move"
            title="Перетащить">
            <GripVertical className="h-4 w-4" />
          </button>

          {!image.isMain && (
            <button
              type="button"
              onClick={onSetMain}
              className="p-2 bg-white rounded-lg shadow-lg hover:shadow-xl"
              title="Сделать главным">
              <Star className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onRemove}
            className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:shadow-xl"
            title="Удалить">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-2">
        {showAltInput ? (
          <div className="flex gap-1">
            <input
              type="text"
              value={altText}
              onChange={e => setAltText(e.target.value)}
              placeholder="Alt текст для SEO"
              className="flex-1 px-2 py-1 text-sm border rounded"
              onKeyDown={e => {
                if (e.key === "Enter") handleAltSave()
                if (e.key === "Escape") setShowAltInput(false)
              }}
            />
            <button
              type="button"
              onClick={handleAltSave}
              className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              ✓
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAltInput(true)}
            className="text-xs text-gray-600 hover:text-gray-800">
            {image.alt || "Добавить alt текст"}
          </button>
        )}
      </div>
    </div>
  )
}

export function ProductImagesManager({
  productId,
  images,
  onImagesChange,
}: ProductImagesManagerProps) {
  const { accessToken } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex(img => img.id === active.id)
      const newIndex = images.findIndex(img => img.id === over?.id)

      const newImages = arrayMove(images, oldIndex, newIndex).map(
        (img, index) => ({
          ...img,
          sortOrder: index,
        })
      )

      onImagesChange(newImages)

      // Если все изображения существуют на сервере
      if (productId && newImages.every(img => !img.id.startsWith("temp-"))) {
        try {
          await productImagesApi.reorder(
            productId,
            newImages.map(img => img.id),
            accessToken!
          )
        } catch (error) {
          console.error("Failed to reorder images:", error)
          setError("Ошибка при изменении порядка изображений")
        }
      }
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ]
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB
    })

    if (validFiles.length === 0) {
      setError(
        "Выберите изображения в формате JPEG, PNG, GIF или WebP размером до 10MB"
      )
      return
    }

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      if (!productId) {
        // Если товар еще не создан, используем локальные URL
        const newImages = validFiles.map(
          (file, index) =>
            ({
              id: `temp-${Date.now()}-${index}`,
              productId: "",
              url: URL.createObjectURL(file),
              alt: "",
              sortOrder: images.length + index,
              isMain: images.length === 0 && index === 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              _file: file, // Сохраняем файл для последующей загрузки
            }) as ProductImage & { _file?: File }
        )

        onImagesChange([...images, ...newImages])
      } else {
        // Если товар существует, загружаем на сервер
        if (!accessToken) {
          setError("Нет токена авторизации. Попробуйте перезагрузить страницу.")
          return
        }

        const uploadedImages: ProductImage[] = []

        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i]
          setUploadProgress(Math.round((i / validFiles.length) * 100))

          try {
            const uploadedImage = await productImagesApi.uploadImage(
              productId,
              file,
              { isMain: images.length === 0 && i === 0 },
              accessToken!
            )
            uploadedImages.push(uploadedImage)
          } catch (error: any) {
            console.error("Failed to upload file:", file.name, error)
            setError(
              `Ошибка загрузки ${file.name}: ${error.message || "Неизвестная ошибка"}`
            )
          }
        }

        if (uploadedImages.length > 0) {
          onImagesChange([...images, ...uploadedImages])
        }
      }

      setUploadProgress(100)
    } catch (error) {
      console.error("Upload error:", error)
      setError("Ошибка при загрузке изображений")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveImage = async (imageId: string) => {
    try {
      // Если это существующее изображение на сервере
      if (productId && !imageId.startsWith("temp-")) {
        await productImagesApi.remove(productId, imageId, accessToken!)
      }

      const wasMain = images.find(img => img.id === imageId)?.isMain
      const newImages = images.filter(img => img.id !== imageId)

      // Если удаляем главное изображение, делаем первое оставшееся главным
      if (wasMain && newImages.length > 0) {
        newImages[0].isMain = true
        if (productId && !newImages[0].id.startsWith("temp-")) {
          await productImagesApi.update(
            productId,
            newImages[0].id,
            { isMain: true },
            accessToken!
          )
        }
      }

      onImagesChange(newImages)
    } catch (error) {
      console.error("Failed to remove image:", error)
      setError("Ошибка при удалении изображения")
    }
  }

  const handleSetMainImage = async (imageId: string) => {
    try {
      const newImages = images.map(img => ({
        ...img,
        isMain: img.id === imageId,
      }))

      // Если это существующее изображение на сервере
      if (productId && !imageId.startsWith("temp-")) {
        await productImagesApi.update(
          productId,
          imageId,
          { isMain: true },
          accessToken!
        )
      }

      onImagesChange(newImages)
    } catch (error) {
      console.error("Failed to set main image:", error)
      setError("Ошибка при установке главного изображения")
    }
  }

  const handleUpdateAlt = async (imageId: string, alt: string) => {
    try {
      const newImages = images.map(img =>
        img.id === imageId ? { ...img, alt } : img
      )

      // Если это существующее изображение на сервере
      if (productId && !imageId.startsWith("temp-")) {
        await productImagesApi.update(productId, imageId, { alt }, accessToken!)
      }

      onImagesChange(newImages)
    } catch (error) {
      console.error("Failed to update alt text:", error)
      setError("Ошибка при обновлении alt текста")
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}>
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />

        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center">
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-4" />
              <p className="text-gray-600">Загрузка... {uploadProgress}%</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Перетащите изображения сюда или{" "}
                <span className="text-blue-600">выберите файлы</span>
              </p>
              <p className="text-sm text-gray-500">
                JPEG, PNG, GIF, WebP до 10MB
              </p>
            </>
          )}
        </label>
      </div>

      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}>
          <SortableContext
            items={images.map(img => img.id)}
            strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(image => (
                <SortableImage
                  key={image.id}
                  image={image}
                  onRemove={() => handleRemoveImage(image.id)}
                  onSetMain={() => handleSetMainImage(image.id)}
                  onUpdateAlt={alt => handleUpdateAlt(image.id, alt)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>Нет загруженных изображений</p>
        </div>
      )}
    </div>
  )
}
