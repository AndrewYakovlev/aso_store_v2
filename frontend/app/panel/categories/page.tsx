import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminCategoriesList } from '@/components/admin/categories/AdminCategoriesList';

export default function AdminCategoriesPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Управление категориями</h1>
        <AdminCategoriesList />
      </div>
    </AdminGuard>
  );
}