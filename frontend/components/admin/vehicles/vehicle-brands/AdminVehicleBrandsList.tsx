"use client"

import { useState, useEffect } from "react"
import { vehicleBrandsApi, VehicleBrandWithCount, VehicleBrandsFilter } from "@/lib/api/vehicles"
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Loader2 } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { DataTable } from "../../DataTable"
import { createVehicleBrandsColumns } from "./columns"
import { VehicleBrandSheet } from "./VehicleBrandSheet"

export function AdminVehicleBrandsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { accessToken } = useAuth()
  const [brands, setBrands] = useState<VehicleBrandWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [countryFilter, setCountryFilter] = useState("")
  const [popularFilter, setPopularFilter] = useState("")
  const [countries, setCountries] = useState<string[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<VehicleBrandWithCount | null>(null)

  const limit = 20

  useEffect(() => {
    loadCountries()
  }, [])

  useEffect(() => {
    const searchQuery = searchParams.get("search") || ""
    const country = searchParams.get("country") || ""
    const popular = searchParams.get("popular") || ""
    const page = parseInt(searchParams.get("page") || "1")
    setSearch(searchQuery)
    setCountryFilter(country)
    setPopularFilter(popular)
    setCurrentPage(page)
    loadBrands(searchQuery, country, popular, page)
  }, [searchParams])

  const loadCountries = async () => {
    try {
      const data = await vehicleBrandsApi.getCountries()
      setCountries(data)
    } catch (error) {
      console.error("Failed to load countries:", error)
    }
  }

  const loadBrands = async (searchQuery: string, country: string, popular: string, page: number) => {
    setLoading(true)
    try {
      const filter: VehicleBrandsFilter = {
        search: searchQuery || undefined,
        country: country || undefined,
        popular: popular === "true" ? true : popular === "false" ? false : undefined,
        page,
        limit,
        sortBy: "name",
        sortOrder: "asc",
      }

      const response = await vehicleBrandsApi.getAll(filter)
      setBrands(response.items as VehicleBrandWithCount[])
      setTotal(response.total)
    } catch (error) {
      console.error("Failed to load vehicle brands:", error)
      // Временно показываем mock данные для тестирования
      const mockBrands: VehicleBrandWithCount[] = [
        {
          id: "1",
          externalId: "bmw",
          name: "BMW",
          nameCyrillic: "БМВ",
          slug: "bmw",
          country: "Германия",
          logo: "https://logo.clearbit.com/bmw.com",
          popular: true,
          isActive: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          modelsCount: 25,
        },
        {
          id: "2", 
          externalId: "mercedes",
          name: "Mercedes-Benz",
          nameCyrillic: "Мерседес-Бенц",
          slug: "mercedes-benz",
          country: "Германия",
          logo: "https://logo.clearbit.com/mercedes-benz.com",
          popular: true,
          isActive: true,
          sortOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          modelsCount: 30,
        },
        {
          id: "3",
          externalId: "toyota",
          name: "Toyota",
          nameCyrillic: "Тойота",
          slug: "toyota",
          country: "Япония",
          popular: false,
          isActive: true,
          sortOrder: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          modelsCount: 15,
        },
      ]
      
      // Применяем фильтры к mock данным
      let filteredBrands = mockBrands
      
      if (searchQuery) {
        filteredBrands = filteredBrands.filter(brand => 
          brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          brand.nameCyrillic.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      if (country) {
        filteredBrands = filteredBrands.filter(brand => brand.country === country)
      }
      
      if (popular === "true") {
        filteredBrands = filteredBrands.filter(brand => brand.popular === true)
      } else if (popular === "false") {
        filteredBrands = filteredBrands.filter(brand => brand.popular === false)
      }
      
      setBrands(filteredBrands)
      setTotal(filteredBrands.length)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (countryFilter) params.set("country", countryFilter)
    if (popularFilter) params.set("popular", popularFilter)
    params.set("page", "1")
    router.push(`/panel/vehicles/brands?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/panel/vehicles/brands?${params.toString()}`)
  }

  const handleEdit = (brand: VehicleBrandWithCount) => {
    setEditingBrand(brand)
    setSheetOpen(true)
  }

  const handleCreate = () => {
    setEditingBrand(null)
    setSheetOpen(true)
  }

  const handleViewModels = (brand: VehicleBrandWithCount) => {
    router.push(`/panel/vehicles/models?brand=${brand.id}`)
  }

  const handleDelete = async (brand: VehicleBrandWithCount) => {
    if (!confirm(`Удалить марку "${brand.name}"? Это действие нельзя отменить.`)) {
      return
    }

    try {
      if (!accessToken) {
        throw new Error("Не авторизован")
      }

      await vehicleBrandsApi.delete(brand.id, accessToken)
      // Перезагрузить список после удаления
      await loadBrands(search, countryFilter, popularFilter, currentPage)
    } catch (error: any) {
      console.error("Failed to delete vehicle brand:", error)
      alert(error.message || "Ошибка при удалении марки автомобиля")
    }
  }

  const handleSheetClose = () => {
    setSheetOpen(false)
    setEditingBrand(null)
  }

  const handleSheetSave = async () => {
    await loadBrands(search, countryFilter, popularFilter, currentPage)
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
            <h2 className="text-xl font-semibold">Марки автомобилей</h2>
            <p className="text-sm text-gray-600 mt-1">
              Управление марками автомобилей и их моделями
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Добавить марку
          </button>
        </div>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию марки..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
            <option value="">Все страны</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <select
            value={popularFilter}
            onChange={e => setPopularFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
            <option value="">Все марки</option>
            <option value="true">Только популярные</option>
            <option value="false">Только обычные</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Найти
          </button>
        </form>
      </div>

      <DataTable
        columns={createVehicleBrandsColumns({
          onEdit: handleEdit,
          onViewModels: handleViewModels,
          onDelete: handleDelete,
        })}
        data={brands}
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
          <VehicleBrandSheet
            brand={editingBrand}
            onSave={handleSheetSave}
            onCancel={handleSheetClose}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}