import { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/dashboard/AdminDashboard';

export const metadata: Metadata = {
  title: 'Админ панель - АСО',
  description: 'Управление интернет-магазином',
};

export default function DashboardPage() {
  return <AdminDashboard />;
}