import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminOrdersList } from '@/components/admin/orders/AdminOrdersList';

export default function AdminOrdersPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Управление заказами</h1>
        <AdminOrdersList />
      </div>
    </AdminGuard>
  );
}