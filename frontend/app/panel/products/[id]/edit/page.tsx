'use client';

import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminProductForm } from '@/components/admin/products/AdminProductForm';
import { useParams } from 'next/navigation';

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Редактирование товара</h1>
        <AdminProductForm productId={productId} />
      </div>
    </AdminGuard>
  );
}