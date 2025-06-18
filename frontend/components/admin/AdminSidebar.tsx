'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  CubeIcon, 
  TagIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  CogIcon,
  ChartBarIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/contexts/AuthContext';

const menuItems = [
  { 
    href: '/admin', 
    label: 'Дашборд', 
    icon: HomeIcon,
    exact: true 
  },
  { 
    href: '/admin/products', 
    label: 'Товары', 
    icon: CubeIcon,
    roles: ['ADMIN', 'MANAGER'] 
  },
  { 
    href: '/admin/categories', 
    label: 'Категории', 
    icon: TagIcon,
    roles: ['ADMIN'] 
  },
  { 
    href: '/admin/orders', 
    label: 'Заказы', 
    icon: ShoppingCartIcon,
    roles: ['ADMIN', 'MANAGER'] 
  },
  { 
    href: '/admin/users', 
    label: 'Пользователи', 
    icon: UsersIcon,
    roles: ['ADMIN'] 
  },
  { 
    href: '/admin/chats', 
    label: 'Чаты', 
    icon: ChatBubbleLeftRightIcon,
    roles: ['ADMIN', 'MANAGER'] 
  },
  { 
    href: '/admin/brands', 
    label: 'Бренды', 
    icon: TruckIcon,
    roles: ['ADMIN'] 
  },
  { 
    href: '/admin/stats', 
    label: 'Статистика', 
    icon: ChartBarIcon,
    roles: ['ADMIN'] 
  },
  { 
    href: '/admin/settings', 
    label: 'Настройки', 
    icon: CogIcon,
    roles: ['ADMIN'] 
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const hasAccess = (roles?: string[]) => {
    if (!roles) return true;
    return user?.role && roles.includes(user.role);
  };

  return (
    <div className="bg-gray-900 text-white w-64 space-y-6 py-7 px-2">
      <div className="flex items-center justify-center mb-6">
        <Link href="/admin" className="text-2xl font-semibold">
          АСО Admin
        </Link>
      </div>
      
      <nav className="space-y-1">
        {menuItems.map((item) => {
          if (!hasAccess(item.roles)) return null;
          
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 py-2.5 px-4 rounded transition duration-200 ${
                active 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}