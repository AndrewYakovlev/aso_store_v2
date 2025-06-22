import { AdminGuard } from '@/components/admin/AdminGuard';
import { ManagerOrderForm } from '@/components/admin/orders/ManagerOrderForm';

export default function NewOrderPage() {
  return (
    <AdminGuard allowedRoles={['ADMIN', 'MANAGER']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Создать заказ для клиента</h1>
        <ManagerOrderForm />
      </div>
    </AdminGuard>
  );
}