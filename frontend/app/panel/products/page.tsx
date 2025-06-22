import { Metadata } from "next"
import { AdminProductsList } from "@/components/admin/products/AdminProductsList"
import Link from "next/link"
import { PlusIcon } from "@heroicons/react/24/outline"

export const metadata: Metadata = {
  title: "Управление товарами - АСО Admin",
  description: "Управление товарами интернет-магазина",
}

export default function AdminProductsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Товары</h1>
      </div>

      <AdminProductsList />
    </div>
  )
}
