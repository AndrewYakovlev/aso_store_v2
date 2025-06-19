import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminBrandsList } from '@/components/admin/brands/AdminBrandsList';

export default function AdminBrandsPage() {
  return (
    <AdminGuard allowedRoles={['ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Управление брендами</h1>
        <AdminBrandsList />
      </div>
    </AdminGuard>
  );
}