import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  ShoppingCartIcon, 
  CubeIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Админ панель - АСО',
  description: 'Управление интернет-магазином',
};

export default function DashboardPage() {
  const quickLinks = [
    {
      href: '/panel/statistics',
      title: 'Статистика',
      description: 'Аналитика и отчеты',
      icon: ChartBarIcon,
      color: 'bg-blue-500',
    },
    {
      href: '/panel/orders',
      title: 'Заказы',
      description: 'Управление заказами',
      icon: ShoppingCartIcon,
      color: 'bg-green-500',
    },
    {
      href: '/panel/products',
      title: 'Товары',
      description: 'Каталог товаров',
      icon: CubeIcon,
      color: 'bg-purple-500',
    },
    {
      href: '/panel/users',
      title: 'Пользователи',
      description: 'Управление клиентами',
      icon: UsersIcon,
      color: 'bg-orange-500',
    },
    {
      href: '/panel/chats',
      title: 'Чаты',
      description: 'Общение с клиентами',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>
        <p className="mt-1 text-sm text-gray-500">
          Добро пожаловать в панель управления магазином
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="block group bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${link.color} p-3 rounded-lg text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-aso-blue transition-colors">
                {link.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {link.description}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/panel/orders/new"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-aso-blue">
              <ShoppingCartIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Создать новый заказ</span>
          </Link>
          <Link
            href="/panel/products/new"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-aso-blue">
              <CubeIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Добавить новый товар</span>
          </Link>
        </div>
      </div>
    </div>
  );
}