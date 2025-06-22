'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFavoritesContext } from '@/lib/contexts/FavoritesContext';
import { useCartContext } from '@/lib/contexts/CartContext';
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
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 relative
                ${isActive ? 'text-aso-blue' : 'text-gray-600'}
              `}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {item.count && item.count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}