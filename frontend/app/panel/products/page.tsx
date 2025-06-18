import { Metadata } from 'next';
import { AdminProductsList } from '@/components/admin/products/AdminProductsList';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Управление товарами - АСО Admin',
  description: 'Управление товарами интернет-магазина',
};

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Товары</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Добавить товар
        </Link>
      </div>
      
      <AdminProductsList />
    </div>
  );
}