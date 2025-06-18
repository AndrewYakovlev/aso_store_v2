import { Metadata } from 'next';
import { DashboardStats } from '@/components/admin/DashboardStats';

export const metadata: Metadata = {
  title: 'Админ панель - АСО',
  description: 'Управление интернет-магазином',
};

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Дашборд</h1>
      <DashboardStats />
    </div>
  );
}