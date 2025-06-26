"use client"

import { useState, useEffect } from "react"
import { vehicleModelsApi, vehicleBrandsApi, VehicleModel, VehicleBrand, VehicleModelsFilter } from "@/lib/api/vehicles"
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Loader2 } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { DataTable } from "../../DataTable"
import { createVehicleModelsColumns } from "./columns"
import { VehicleModelSheet } from "./VehicleModelSheet"
import Link from "next/link"

export function AdminVehicleModelsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { accessToken } = useAuth()
  const [models, setModels] = useState<VehicleModel[]>([])
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [classes, setClasses] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrand | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<VehicleModel | null>(null)

  const limit = 20

  useEffect(() => {
    loadBrands()
    loadClasses()
  }, [])

  useEffect(() => {
    const searchQuery = searchParams.get("search") || ""
    const brandId = searchParams.get("brand") || ""
    const vehicleClass = searchParams.get("class") || ""
    const page = parseInt(searchParams.get("page") || "1")
    setSearch(searchQuery)
    setBrandFilter(brandId)
    setClassFilter(vehicleClass)
    setCurrentPage(page)
    loadModels(searchQuery, brandId, vehicleClass, page)
    
    // Найти выбранную марку для отображения в заголовке
    if (brandId && brands.length > 0) {
      const brand = brands.find(b => b.id === brandId)
      setSelectedBrand(brand || null)
    }
  }, [searchParams, brands])

  const loadBrands = async () => {
    try {
      const response = await vehicleBrandsApi.getAll({ limit: 1000 })
      setBrands(response.items)
    } catch (error) {
      console.error("Failed to load brands:", error)
    }
  }

  const loadClasses = async () => {
    try {
      const data = await vehicleModelsApi.getClasses()
      setClasses(data)
    } catch (error) {
      console.error("Failed to load classes:", error)
    }
  }

  const loadModels = async (searchQuery: string, brandId: string, vehicleClass: string, page: number) => {
    setLoading(true)
    try {
      const filter: VehicleModelsFilter = {
        search: searchQuery || undefined,
        brandId: brandId || undefined,
        class: vehicleClass || undefined,
        page,
        limit,
        sortBy: "name",
        sortOrder: "asc",
      }

      const response = await vehicleModelsApi.getAll(filter)
      setModels(response.items)
      setTotal(response.total)
    } catch (error) {
      console.error("Failed to load vehicle models:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (brandFilter) params.set("brand", brandFilter)
    if (classFilter) params.set("class", classFilter)
    params.set("page", "1")
    router.push(`/panel/vehicles/models?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/panel/vehicles/models?${params.toString()}`)
  }

  const handleEdit = (model: VehicleModel) => {
    setEditingModel(model)
    setSheetOpen(true)
  }

  const handleCreate = () => {
    setEditingModel(null)
    setSheetOpen(true)
  }

  const handleDelete = async (model: VehicleModel) => {
    if (!confirm(`Удалить модель "${model.name}"? Это действие нельзя отменить.`)) {
      return
    }

    try {
      if (!accessToken) {
        throw new Error("Не авторизован")
      }

      await vehicleModelsApi.delete(model.id, accessToken)
      // Перезагрузить список после удаления
      await loadModels(search, brandFilter, classFilter, currentPage)
    } catch (error: any) {
      console.error("Failed to delete vehicle model:", error)
      alert(error.message || "Ошибка при удалении модели автомобиля")
    }
  }

  const handleSheetClose = () => {
    setSheetOpen(false)
    setEditingModel(null)
  }

  const handleSheetSave = async () => {
    await loadModels(search, brandFilter, classFilter, currentPage)
    handleSheetClose()
  }

  const totalPages = Math.ceil(total / limit)

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
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link 
                href="/panel/vehicles/brands"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Марки
              </Link>
              {selectedBrand && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-medium">{selectedBrand.name}</span>
                </>
              )}
            </div>
            <h2 className="text-xl font-semibold">
              {selectedBrand ? `Модели ${selectedBrand.name}` : "Модели автомобилей"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Управление моделями автомобилей
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Добавить модель
          </button>
        </div>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию модели..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
            <option value="">Все марки</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
            <option value="">Все классы</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Найти
          </button>
        </form>
      </div>

      <DataTable
        columns={createVehicleModelsColumns({
          onEdit: handleEdit,
          onDelete: handleDelete,
        })}
        data={models}
      />

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Показано {(currentPage - 1) * limit + 1} -{" "}
            {Math.min(currentPage * limit, total)} из {total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-50"
                  }`}>
                  {page}
                </button>
              )
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-1/3">
          <VehicleModelSheet
            model={editingModel}
            onSave={handleSheetSave}
            onCancel={handleSheetClose}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}