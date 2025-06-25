"use client"

import { useState, useEffect } from "react"
import { usersApi, User, Role, UserFilter } from "@/lib/api/users"
import {
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Loader2 } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { DataTable } from "../DataTable"
import { createUsersColumns } from "./columns"
import { UserSheet } from "./UserSheet"
import { Pagination } from "@/components/Pagination"

export function AdminUsersList() {
  const { accessToken } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState<UserFilter>({
    page: 1,
    limit: 20,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  const [deleting, setDeleting] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [filter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await usersApi.getAll(accessToken!, filter)
      setUsers(response.data)
      setTotalPages(response.meta.totalPages)
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      return
    }

    setDeleting(id)
    try {
      await usersApi.delete(accessToken!, id)
      await loadUsers()
    } catch (error: any) {
      console.error("Failed to delete user:", error)
      alert(error.response?.data?.message || "Ошибка при удалении пользователя")
    } finally {
      setDeleting(null)
    }
  }


  const handleCreate = () => {
    setEditingUser(null)
    setSheetOpen(true)
  }

  const handleSheetClose = () => {
    setSheetOpen(false)
    setEditingUser(null)
  }

  const handleSheetSave = async () => {
    await loadUsers()
    handleSheetClose()
  }

  const handleFilterChange = (field: keyof UserFilter, value: any) => {
    setFilter(prev => ({ ...prev, [field]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilter(prev => ({ ...prev, page }))
  }

  if (loading && !users.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Добавить пользователя
          </button>
        </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <input
                type="search"
                value={filter.search}
                onChange={e => handleFilterChange("search", e.target.value)}
                placeholder="Поиск по имени, телефону или email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Role Filter */}
            <select
              value={filter.role || ""}
              onChange={e => handleFilterChange("role", e.target.value || undefined)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
              <option value="">Все роли</option>
              <option value={Role.CUSTOMER}>Покупатели</option>
              <option value={Role.MANAGER}>Менеджеры</option>
              <option value={Role.ADMIN}>Администраторы</option>
            </select>

            {/* Sort */}
            <select
              value={`${filter.sortBy}:${filter.sortOrder}`}
              onChange={e => {
                const [sortBy, sortOrder] = e.target.value.split(':')
                handleFilterChange("sortBy", sortBy)
                handleFilterChange("sortOrder", sortOrder as 'asc' | 'desc')
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
              <option value="createdAt:desc">Сначала новые</option>
              <option value="createdAt:asc">Сначала старые</option>
              <option value="firstName:asc">По имени (А-Я)</option>
              <option value="firstName:desc">По имени (Я-А)</option>
            </select>
          </div>

        <DataTable
          columns={createUsersColumns({
            onDelete: handleDelete,
            deleting,
          })}
          data={users}
        />

        {users.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            {filter.search || filter.role
              ? "Пользователи не найдены по заданным фильтрам"
              : "Пользователи не найдены"}
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={filter.page || 1}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-1/3">
          <UserSheet
            user={editingUser}
            onSave={handleSheetSave}
            onCancel={handleSheetClose}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}