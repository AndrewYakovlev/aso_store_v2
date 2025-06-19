"use client"

import { useState, useEffect } from "react"
import {
  categoriesApi,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/lib/api/categories"
import { useAuth } from "@/lib/contexts/AuthContext"
import {
  PlusIcon,
} from "@heroicons/react/24/outline"
import { Loader2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { CategorySheet } from "./CategorySheet"
import { DataTable } from "../DataTable"
import { createCategoriesColumns } from "./columns"

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
  level?: number
}

export function AdminCategoriesList() {
  const { accessToken } = useAuth()
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = await categoriesApi.getAll({
        onlyActive: false,
        includeProductCount: true,
      })

      // Создаем древовидную структуру
      const categoriesMap = new Map<string, CategoryWithChildren>()
      const rootCategories: CategoryWithChildren[] = []

      // Сначала создаем все узлы
      data.forEach(category => {
        categoriesMap.set(category.id, { ...category, children: [] })
      })

      // Затем строим дерево
      data.forEach(category => {
        const categoryNode = categoriesMap.get(category.id)!
        if (category.parentId) {
          const parent = categoriesMap.get(category.parentId)
          if (parent) {
            parent.children!.push(categoryNode)
          }
        } else {
          rootCategories.push(categoryNode)
        }
      })

      // Сортируем по sortOrder
      const sortCategories = (categories: CategoryWithChildren[]) => {
        categories.sort((a, b) => a.sortOrder - b.sortOrder)
        categories.forEach(category => {
          if (category.children && category.children.length > 0) {
            sortCategories(category.children)
          }
        })
      }

      sortCategories(rootCategories)
      setCategories(rootCategories)
    } catch (error) {
      console.error("Failed to load categories:", error)
      setError("Не удалось загрузить категории")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Вы уверены, что хотите удалить эту категорию? Все подкатегории также будут удалены."
      )
    ) {
      return
    }

    setDeleting(id)
    try {
      await categoriesApi.delete(id, accessToken!)
      await loadCategories()
    } catch (error: any) {
      console.error("Failed to delete category:", error)
      alert(error.response?.data?.message || "Ошибка при удалении категории")
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setSheetOpen(true)
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setSheetOpen(true)
  }

  const handleSheetClose = () => {
    setSheetOpen(false)
    setEditingCategory(null)
  }

  const handleSheetSave = async () => {
    await loadCategories()
    handleSheetClose()
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  // Создаем плоский список для DataTable с учетом развернутых категорий
  const getFlatCategoriesForTable = (cats: CategoryWithChildren[], level: number = 0): CategoryWithChildren[] => {
    const result: CategoryWithChildren[] = []
    
    cats.forEach(cat => {
      const categoryWithLevel = { ...cat, level }
      result.push(categoryWithLevel)
      
      if (cat.children && cat.children.length > 0 && expandedIds.has(cat.id)) {
        result.push(...getFlatCategoriesForTable(cat.children, level + 1))
      }
    })
    
    return result
  }


  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600 text-center py-12">{error}</div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Категории товаров</h2>
              <p className="text-sm text-gray-600 mt-1">
                Управление иерархическими категориями товаров
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Развернуть все
                  const allIds = new Set<string>()
                  const addIds = (cats: CategoryWithChildren[]) => {
                    cats.forEach(cat => {
                      if (cat.children && cat.children.length > 0) {
                        allIds.add(cat.id)
                        addIds(cat.children)
                      }
                    })
                  }
                  addIds(categories)
                  setExpandedIds(allIds)
                }}
                className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                Развернуть все
              </button>
              <button
                onClick={() => setExpandedIds(new Set())}
                className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                Свернуть все
              </button>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <PlusIcon className="h-5 w-5" />
                Добавить категорию
              </button>
            </div>
          </div>
        </div>

        <DataTable
          columns={createCategoriesColumns({
            onEdit: handleEdit,
            onDelete: handleDelete,
            deleting,
            expandedIds,
            toggleExpanded,
          })}
          data={getFlatCategoriesForTable(categories)}
        />
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-1/3">
          <CategorySheet
            category={editingCategory}
            categories={categories}
            onSave={handleSheetSave}
            onCancel={handleSheetClose}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
