"use client"

import { useState, useEffect } from "react"
import { productsApi, Product, ProductsFilter } from "@/lib/api/products"
import Image from "next/image"
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
import { ProductSheet } from "./ProductSheet"
import { DataTable } from "../DataTable"
import { createProductsColumns } from "./columns"

export function AdminProductsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { accessToken } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const limit = 20

  useEffect(() => {
    const searchQuery = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    setSearch(searchQuery)
    setCurrentPage(page)
    loadProducts(searchQuery, page)
  }, [searchParams])

  const loadProducts = async (searchQuery: string, page: number) => {
    setLoading(true)
    try {
      const filter: ProductsFilter = {
        search: searchQuery || undefined,
        page,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      }

      const response = await productsApi.getAll(filter)
      setProducts(response.items)
      setTotal(response.total)
    } catch (error) {
      console.error("Failed to load products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    params.set("page", "1")
    router.push(`/panel/products?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/panel/products?${params.toString()}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот товар?")) {
      return
    }

    setDeleting(id)
    try {
      await productsApi.delete(id, accessToken!)
      await loadProducts(search, currentPage)
    } catch (error) {
      console.error("Failed to delete product:", error)
      alert("Ошибка при удалении товара")
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setSheetOpen(true)
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setSheetOpen(true)
  }

  const handleSheetClose = () => {
    setSheetOpen(false)
    setEditingProduct(null)
  }

  const handleSheetSave = async () => {
    await loadProducts(search, currentPage)
    handleSheetClose()
  }

  const totalPages = Math.ceil(total / limit)

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Управление товарами</h2>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Добавить товар
          </button>
        </div>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию или артикулу..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Найти
          </button>
        </form>
      </div>

      <DataTable
        columns={createProductsColumns({
          onEdit: handleEdit,
          onDelete: handleDelete,
          deleting,
        })}
        data={products}
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
        <SheetContent className="w-[50vw] max-w-none">
          <ProductSheet
            product={editingProduct}
            onSave={handleSheetSave}
            onCancel={handleSheetClose}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
