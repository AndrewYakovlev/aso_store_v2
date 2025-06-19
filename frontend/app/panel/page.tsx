import { Metadata } from 'next';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { AdminContainer } from '@/components/admin/AdminContainer';

export const metadata: Metadata = {
  title: 'Админ панель - АСО',
  description: 'Управление интернет-магазином',
};

export default function AdminDashboard() {
  return (
    <AdminContainer>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Дашборд</h1>
      <DashboardStats />
    </AdminContainer>
  );
}