"use client"

import { useState, useEffect } from "react"
import { anonymousUsersApi, AnonymousUser, AnonymousUserFilter } from "@/lib/api/anonymous-users"
import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Loader2 } from "lucide-react"
import { DataTable } from "../DataTable"
import { createAnonymousUsersColumns } from "./anonymous-columns"
import { Pagination } from "@/components/Pagination"
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export function AdminAnonymousUsersList() {
  const { accessToken } = useAuth()
  const [users, setUsers] = useState<AnonymousUser[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState<AnonymousUserFilter>({
    page: 1,
    limit: 20,
    search: "",
    sortBy: "lastActivity",
    sortOrder: "desc",
  })
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [filter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await anonymousUsersApi.getAll(accessToken!, filter)
      setUsers(response.data)
      setTotalPages(response.meta.totalPages)
    } catch (error) {
      console.error("Failed to load anonymous users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого анонимного пользователя? Все связанные данные (корзина, избранное, чаты) будут удалены.")) {
      return
    }

    setDeleting(id)
    try {
      await anonymousUsersApi.delete(accessToken!, id)
      await loadUsers()
    } catch (error: any) {
      console.error("Failed to delete anonymous user:", error)
      alert(error.response?.data?.message || "Ошибка при удалении пользователя")
    } finally {
      setDeleting(null)
    }
  }

  const handleFilterChange = (field: keyof AnonymousUserFilter, value: any) => {
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
    <div className="p-6">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Анонимные пользователи автоматически создаются при первом посещении сайта
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <input
            type="search"
            value={filter.search}
            onChange={e => handleFilterChange("search", e.target.value)}
            placeholder="Поиск по токену..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        {/* Sort */}
        <select
          value={`${filter.sortBy}:${filter.sortOrder}`}
          onChange={e => {
            const [sortBy, sortOrder] = e.target.value.split(':')
            handleFilterChange("sortBy", sortBy)
            handleFilterChange("sortOrder", sortOrder as 'asc' | 'desc')
          }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
          <option value="lastActivity:desc">Последняя активность (новые)</option>
          <option value="lastActivity:asc">Последняя активность (старые)</option>
          <option value="createdAt:desc">Дата создания (новые)</option>
          <option value="createdAt:asc">Дата создания (старые)</option>
        </select>
      </div>

      <DataTable
        columns={createAnonymousUsersColumns({
          onDelete: handleDelete,
          deleting,
        })}
        data={users}
      />

      {users.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          {filter.search
            ? "Анонимные пользователи не найдены по заданному фильтру"
            : "Анонимные пользователи не найдены"}
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
  )
}