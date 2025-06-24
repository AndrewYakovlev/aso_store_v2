"use client"

import { useState, useEffect } from "react"
import { attributesApi, Attribute, AttributeType, AttributesFilter } from "@/lib/api/attributes"
import {
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Loader2 } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { DataTable } from "../DataTable"
import { createAttributesColumns } from "./columns"
import { AttributeSheet } from "./AttributeSheet"

export function AdminAttributesList() {
  const { accessToken } = useAuth()
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [requiredFilter, setRequiredFilter] = useState("")
  const [filterableFilter, setFilterableFilter] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null)

  useEffect(() => {
    loadAttributes()
  }, [search, typeFilter, requiredFilter, filterableFilter])

  const loadAttributes = async () => {
    setLoading(true)
    try {
      const filter: AttributesFilter = {
        search: search || undefined,
        type: typeFilter as AttributeType || undefined,
        isRequired: requiredFilter === "true" ? true : requiredFilter === "false" ? false : undefined,
        isFilterable: filterableFilter === "true" ? true : filterableFilter === "false" ? false : undefined,
        sortBy: "sortOrder",
        sortOrder: "asc",
      }

      const data = await attributesApi.getAll(filter)
      setAttributes(data)
    } catch (error) {
      console.error("Failed to load attributes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот атрибут?")) {
      return
    }

    setDeleting(id)
    try {
      await attributesApi.delete(id, accessToken!)
      await loadAttributes()
    } catch (error: any) {
      console.error("Failed to delete attribute:", error)
      alert(error.response?.data?.message || "Ошибка при удалении атрибута")
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (attribute: Attribute) => {
    setEditingAttribute(attribute)
    setSheetOpen(true)
  }

  const handleCreate = () => {
    setEditingAttribute(null)
    setSheetOpen(true)
  }

  const handleSheetClose = () => {
    setSheetOpen(false)
    setEditingAttribute(null)
  }

  const handleSheetSave = async () => {
    await loadAttributes()
    handleSheetClose()
  }

  const attributeTypeOptions = [
    { value: "", label: "Все типы" },
    { value: AttributeType.TEXT, label: "Текст" },
    { value: AttributeType.NUMBER, label: "Число" },
    { value: AttributeType.COLOR, label: "Цвет" },
    { value: AttributeType.SELECT_ONE, label: "Выбор одного" },
    { value: AttributeType.SELECT_MANY, label: "Выбор нескольких" },
  ]

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Атрибуты товаров</h2>
              <p className="text-sm text-gray-600 mt-1">
                Управление характеристиками и свойствами товаров
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Добавить атрибут
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по названию или коду..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
              {attributeTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {/* Required Filter */}
            <select
              value={requiredFilter}
              onChange={e => setRequiredFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
              <option value="">Все атрибуты</option>
              <option value="true">Только обязательные</option>
              <option value="false">Только необязательные</option>
            </select>

            {/* Filterable Filter */}
            <select
              value={filterableFilter}
              onChange={e => setFilterableFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
              <option value="">Все атрибуты</option>
              <option value="true">Только фильтруемые</option>
              <option value="false">Только нефильтруемые</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearch("")
                setTypeFilter("")
                setRequiredFilter("")
                setFilterableFilter("")
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Очистить фильтры
            </button>
          </div>
        </div>

        <DataTable
          columns={createAttributesColumns({
            onEdit: handleEdit,
            onDelete: handleDelete,
            deleting,
          })}
          data={attributes}
        />

        {attributes.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            {search || typeFilter || requiredFilter || filterableFilter
              ? "Атрибуты не найдены по заданным фильтрам"
              : "Атрибуты не созданы"}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-1/3 max-h-screen overflow-hidden flex flex-col">
          <AttributeSheet
            attribute={editingAttribute}
            onSave={handleSheetSave}
            onCancel={handleSheetClose}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}