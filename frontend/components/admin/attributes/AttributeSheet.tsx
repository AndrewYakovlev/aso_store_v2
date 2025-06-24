"use client"

import { useState, useEffect } from "react"
import {
  Attribute,
  AttributeType,
  CreateAttributeDto,
  UpdateAttributeDto,
  attributesApi,
} from "@/lib/api/attributes"
import { categoriesApi, Category } from "@/lib/api/categories"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { SheetDescription } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Loader2, Plus, X } from "lucide-react"

interface AttributeSheetProps {
  attribute?: Attribute | null
  onSave: () => void
  onCancel: () => void
}

interface CategoryAssignment {
  categoryId: string
  isRequired: boolean
}

export function AttributeSheet({
  attribute,
  onSave,
  onCancel,
}: AttributeSheetProps) {
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: AttributeType.TEXT,
    unit: "",
    isRequired: false,
    isFilterable: false,
    sortOrder: 0,
    options: [] as string[],
  })
  const [categoryAssignments, setCategoryAssignments] = useState<
    CategoryAssignment[]
  >([])

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (attribute) {
      setFormData({
        code: attribute.code,
        name: attribute.name,
        type: attribute.type,
        unit: attribute.unit || "",
        isRequired: attribute.isRequired,
        isFilterable: attribute.isFilterable,
        sortOrder: attribute.sortOrder,
        options: attribute.options
          ?.sort((a, b) => a.sortOrder - b.sortOrder)
          .map(opt => opt.value) || [],
      })

      // Загружаем связи с категориями
      if (attribute.categoryAttributes) {
        setCategoryAssignments(
          attribute.categoryAttributes.map(ca => ({
            categoryId: ca.categoryId,
            isRequired: ca.isRequired,
          }))
        )
      }
    }
  }, [attribute])

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll({ onlyActive: false })
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // При смене типа очистить опции если они больше не нужны
    if (field === "type") {
      if (
        value !== AttributeType.SELECT_ONE &&
        value !== AttributeType.SELECT_MANY
      ) {
        setFormData(prev => ({ ...prev, options: [] }))
      }
    }
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, ""],
    }))
  }

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }))
  }

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }))
  }

  const addCategoryAssignment = () => {
    setCategoryAssignments(prev => [
      ...prev,
      { categoryId: "", isRequired: false },
    ])
  }

  const updateCategoryAssignment = (
    index: number,
    field: keyof CategoryAssignment,
    value: any
  ) => {
    setCategoryAssignments(prev =>
      prev.map((assignment, i) =>
        i === index ? { ...assignment, [field]: value } : assignment
      )
    )
  }

  const removeCategoryAssignment = (index: number) => {
    setCategoryAssignments(prev => prev.filter((_, i) => i !== index))
  }

  const isSelectType =
    formData.type === AttributeType.SELECT_ONE ||
    formData.type === AttributeType.SELECT_MANY

  const updateCategoryAssignments = async (attributeId: string) => {
    // Получаем текущие связи с категориями
    const currentAssignments = attribute?.categoryAttributes || []

    // Удаляем связи, которых больше нет
    for (const current of currentAssignments) {
      const stillExists = categoryAssignments.some(
        ca => ca.categoryId === current.categoryId
      )
      if (!stillExists) {
        try {
          await attributesApi.removeFromCategory(
            current.categoryId,
            attributeId,
            accessToken!
          )
        } catch (error) {
          console.error("Failed to remove category assignment:", error)
        }
      }
    }

    // Добавляем новые связи (только те, которых еще нет)
    for (const assignment of categoryAssignments) {
      if (!assignment.categoryId) continue

      const alreadyExists = currentAssignments.some(
        ca => ca.categoryId === assignment.categoryId
      )
      
      if (!alreadyExists) {
        try {
          await attributesApi.assignToCategory(
            assignment.categoryId,
            {
              attributeIds: [attributeId],
              isRequired: assignment.isRequired,
            },
            accessToken!
          )
        } catch (error) {
          console.error("Failed to assign to category:", error)
        }
      } else {
        // Если связь уже существует, но изменился isRequired, нужно удалить и создать заново
        const current = currentAssignments.find(ca => ca.categoryId === assignment.categoryId)
        if (current && current.isRequired !== assignment.isRequired) {
          try {
            await attributesApi.removeFromCategory(
              assignment.categoryId,
              attributeId,
              accessToken!
            )
            await attributesApi.assignToCategory(
              assignment.categoryId,
              {
                attributeIds: [attributeId],
                isRequired: assignment.isRequired,
              },
              accessToken!
            )
          } catch (error) {
            console.error("Failed to update category assignment:", error)
          }
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Валидация
      if (
        isSelectType &&
        formData.options.filter(opt => opt.trim()).length === 0
      ) {
        alert("Для типа 'Выбор' необходимо добавить хотя бы одну опцию")
        return
      }

      const submitData = {
        ...formData,
        unit: formData.unit.trim() || undefined,
        options: isSelectType
          ? formData.options
              .filter(opt => opt.trim())
              .map((value, index) => ({ value, sortOrder: index }))
          : undefined,
      }

      let attributeId: string

      if (attribute) {
        // Обновление (код нельзя менять)
        const updateData: UpdateAttributeDto = {
          name: submitData.name,
          type: submitData.type,
          unit: submitData.unit,
          isRequired: submitData.isRequired,
          isFilterable: submitData.isFilterable,
          sortOrder: submitData.sortOrder,
          options: submitData.options,
        }
        await attributesApi.update(attribute.id, updateData, accessToken!)
        attributeId = attribute.id
      } else {
        // Создание
        const createData: CreateAttributeDto = {
          code: submitData.code,
          name: submitData.name,
          type: submitData.type,
          unit: submitData.unit,
          isRequired: submitData.isRequired,
          isFilterable: submitData.isFilterable,
          sortOrder: submitData.sortOrder,
          options: submitData.options,
        }
        const newAttribute = await attributesApi.create(
          createData,
          accessToken!
        )
        attributeId = newAttribute.id
      }

      // Обновляем связи с категориями
      await updateCategoryAssignments(attributeId)

      onSave()
    } catch (error: any) {
      console.error("Failed to save attribute:", error)
      alert(error.response?.data?.message || "Ошибка при сохранении атрибута")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SheetHeader className="border-b p-6 pb-4">
        <SheetTitle>
          {attribute ? "Редактировать атрибут" : "Добавить атрибут"}
        </SheetTitle>
        <SheetDescription>
          Заполните информацию об атрибуте товаров
        </SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 pb-4">
          {/* Code */}
          {!attribute && (
            <div className="space-y-2">
              <Label htmlFor="code">Код атрибута *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={e => handleInputChange("code", e.target.value)}
                placeholder="color"
                pattern="^[a-z0-9_]+$"
                title="Только строчные буквы, цифры и подчеркивания"
                required
              />
              <p className="text-xs text-muted-foreground">
                Уникальный код для API (только латинские буквы, цифры и _)
              </p>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleInputChange("name", e.target.value)}
              placeholder="Цвет"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Тип атрибута *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={e =>
                handleInputChange("type", e.target.value as AttributeType)
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required>
              <option value={AttributeType.TEXT}>Текст</option>
              <option value={AttributeType.NUMBER}>Число</option>
              <option value={AttributeType.COLOR}>Цвет</option>
              <option value={AttributeType.SELECT_ONE}>Выбор одного</option>
              <option value={AttributeType.SELECT_MANY}>
                Выбор нескольких
              </option>
            </select>
          </div>

          {/* Unit */}
          {(formData.type === AttributeType.NUMBER ||
            formData.type === AttributeType.TEXT) && (
            <div className="space-y-2">
              <Label htmlFor="unit">Единица измерения</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={e => handleInputChange("unit", e.target.value)}
                placeholder="см, кг, л и т.д."
              />
            </div>
          )}

          {/* Options for SELECT types */}
          {isSelectType && (
            <div className="space-y-2">
              <Label>Варианты выбора *</Label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={e => updateOption(index, e.target.value)}
                      placeholder={`Вариант ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить вариант
                </Button>
              </div>
            </div>
          )}

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Порядок сортировки</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={e =>
                handleInputChange("sortOrder", parseInt(e.target.value) || 0)
              }
              min="0"
            />
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="isRequired">Обязательный атрибут</Label>
              <Switch
                id="isRequired"
                checked={formData.isRequired}
                onCheckedChange={checked =>
                  handleInputChange("isRequired", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isFilterable">Использовать в фильтрах</Label>
              <Switch
                id="isFilterable"
                checked={formData.isFilterable}
                onCheckedChange={checked =>
                  handleInputChange("isFilterable", checked)
                }
              />
            </div>
          </div>

          {/* Category Assignments */}
          <div className="space-y-2">
            <Label>Категории</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Выберите категории, в которых будет использоваться этот атрибут
            </p>
            <div className="space-y-3">
              {categoryAssignments.map((assignment, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={assignment.categoryId}
                      onChange={e =>
                        updateCategoryAssignment(
                          index,
                          "categoryId",
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                      <option value="">Выберите категорию</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCategoryAssignment(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Обязательный для этой категории</Label>
                    <Switch
                      checked={assignment.isRequired}
                      onCheckedChange={checked =>
                        updateCategoryAssignment(index, "isRequired", checked)
                      }
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addCategoryAssignment}
                className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Добавить категорию
              </Button>
            </div>
          </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t bg-background mt-auto">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {attribute ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </form>
    </>
  )
}
