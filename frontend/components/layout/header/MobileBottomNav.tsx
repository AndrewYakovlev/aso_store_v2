'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFavoritesContext } from '@/lib/contexts/FavoritesContext';
import { useCartContext } from '@/lib/contexts/CartContext';
import { useNotifications } from '@/lib/contexts/NotificationContext';
import {
  HeartIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  Squares2X2Icon as Squares2X2SolidIcon,
  ShoppingCartIcon as ShoppingCartSolidIcon,
  ChatBubbleLeftRightIcon as ChatBubbleSolidIcon,
} from '@heroicons/react/24/solid';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { favoriteIds } = useFavoritesContext();
  const { summary } = useCartContext();
  const { totalUnread } = useNotifications();
  
  // Hide navigation on chat page
  if (pathname === '/chat') {
    return null;
  }

  const navigation = [
    {
      name: 'Избранное',
      href: '/favorites',
      icon: HeartIcon,
      activeIcon: HeartSolidIcon,
      count: favoriteIds.length,
    },
    {
      name: 'Каталог',
      href: '/catalog',
      icon: Squares2X2Icon,
      activeIcon: Squares2X2SolidIcon,
    },
    {
      name: 'Корзина',
      href: '/cart',
      icon: ShoppingCartIcon,
      activeIcon: ShoppingCartSolidIcon,
      count: summary?.totalQuantity || 0,
    },
    {
      name: 'Чат',
      href: '/chat',
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatBubbleSolidIcon,
      count: totalUnread,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-4 items-stretch pb-safe">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                relative flex flex-col items-center justify-center px-1 py-2 transition-colors
                ${isActive ? 'text-aso-blue' : 'text-gray-600 active:text-gray-900'}
              `}
            >
              <div className="relative w-7 h-7 flex items-center justify-center">
                <Icon className="h-6 w-6" />
                {item.count !== undefined && item.count > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] 
                               font-bold rounded-full min-w-[16px] h-[16px] 
                               flex items-center justify-center px-0.5
                               ring-2 ring-white"
                  >
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-none mt-1 ${isActive ? 'font-medium' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}