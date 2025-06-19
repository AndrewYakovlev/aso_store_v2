import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminProductForm } from '@/components/admin/products/AdminProductForm';

export default function NewProductPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Создание товара</h1>
        <AdminProductForm />
      </div>
    </AdminGuard>
  );
}