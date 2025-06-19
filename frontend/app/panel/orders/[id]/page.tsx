'use client';

import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminOrderDetails } from '@/components/admin/orders/AdminOrderDetails';
import { useParams } from 'next/navigation';

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <AdminOrderDetails orderId={orderId} />
      </div>
    </AdminGuard>
  );
}