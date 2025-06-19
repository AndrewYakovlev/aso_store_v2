"use client"

import { useState, useEffect } from "react"
import {
  categoriesApi,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/lib/api/categories"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Loader2 } from "lucide-react"
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { generateSlug } from "@/lib/utils/slug"

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
}

interface CategorySheetProps {
  category: Category | null
  categories: CategoryWithChildren[]
  onSave: () => void
  onCancel: () => void
}

export function CategorySheet({
  category,
  categories,
  onSave,
  onCancel,
}: CategorySheetProps) {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "",
    isActive: true,
    sortOrder: 0,
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        parentId: category.parentId || "",
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      })
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        parentId: "",
        isActive: true,
        sortOrder: 0,
      })
    }
    setError(null)
  }, [category])

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !category ? generateSlug(name) : prev.slug,
    }))
  }

  // Получаем плоский список всех категорий для выбора родительской
  const getFlatCategories = (
    cats: CategoryWithChildren[],
    level: number = 0
  ): Array<CategoryWithChildren & { level: number }> => {
    const result: Array<CategoryWithChildren & { level: number }> = []

    cats.forEach(cat => {
      // Исключаем текущую категорию и её потомков из списка возможных родителей
      if (category && isCurrentCategoryOrDescendant(cat, category.id)) {
        return
      }

      result.push({ ...cat, level })
      if (cat.children && cat.children.length > 0) {
        result.push(...getFlatCategories(cat.children, level + 1))
      }
    })

    return result
  }

  // Проверяем, является ли категория текущей редактируемой или её потомком
  const isCurrentCategoryOrDescendant = (
    cat: CategoryWithChildren,
    editingCategoryId: string
  ): boolean => {
    // Если это сама редактируемая категория
    if (cat.id === editingCategoryId) {
      return true
    }

    // Если это потомок редактируемой категории
    return isDescendantOf(cat, editingCategoryId)
  }

  // Проверяем, является ли категория потомком указанного ID (рекурсивно по родителям)
  const isDescendantOf = (
    cat: CategoryWithChildren,
    ancestorId: string
  ): boolean => {
    // Проверяем через parentId вверх по иерархии
    if (!cat.parentId) return false
    if (cat.parentId === ancestorId) return true

    // Находим родителя и проверяем рекурсивно
    const findCategoryById = (
      cats: CategoryWithChildren[],
      id: string
    ): CategoryWithChildren | null => {
      for (const c of cats) {
        if (c.id === id) return c
        if (c.children) {
          const found = findCategoryById(c.children, id)
          if (found) return found
        }
      }
      return null
    }

    const parent = findCategoryById(categories, cat.parentId)
    return parent ? isDescendantOf(parent, ancestorId) : false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data: CreateCategoryDto | UpdateCategoryDto = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        parentId: formData.parentId || undefined,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      }

      if (category) {
        await categoriesApi.update(
          category.id,
          data as UpdateCategoryDto,
          accessToken!
        )
      } else {
        await categoriesApi.create(data as CreateCategoryDto, accessToken!)
      }

      onSave()
    } catch (error: any) {
      console.error("Failed to save category:", error)
      setError(
        error.response?.data?.message || "Ошибка при сохранении категории"
      )
    } finally {
      setLoading(false)
    }
  }

  const flatCategories = getFlatCategories(categories)

  return (
    <div className="flex flex-col h-full px-6 pb-4">
      <SheetHeader>
        <SheetTitle>
          {category ? "Редактирование категории" : "Создание категории"}
        </SheetTitle>
        <SheetDescription>
          {category
            ? `Редактируйте информацию о категории "${category.name}"`
            : "Создайте новую категорию товаров"}
        </SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 mt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название категории <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите название категории"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL-адрес (slug) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={e =>
                setFormData(prev => ({ ...prev, slug: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="url-адрес-категории"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Родительская категория
            </label>
            <select
              value={formData.parentId}
              onChange={e =>
                setFormData(prev => ({ ...prev, parentId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Без родительской категории (корневая)</option>
              {flatCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {"\u00A0\u00A0".repeat(cat.level * 2)}
                  {"└─".repeat(cat.level > 0 ? 1 : 0)} {cat.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Выберите родительскую категорию для создания подкатегории
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Опишите категорию товаров"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Порядок сортировки
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  sortOrder: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-sm text-gray-500 mt-1">
              Категории с меньшим номером отображаются первыми
            </p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e =>
                  setFormData(prev => ({ ...prev, isActive: e.target.checked }))
                }
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Категория активна
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Неактивные категории не отображаются на сайте
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            disabled={loading}>
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : category ? (
              "Сохранить"
            ) : (
              "Создать"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
