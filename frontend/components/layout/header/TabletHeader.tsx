'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useFavoritesContext } from '@/lib/contexts/FavoritesContext';
import { useCartContext } from '@/lib/contexts/CartContext';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { MobileMenu } from './MobileMenu';
import { CallbackModal } from './CallbackModal';

export function TabletHeader() {
  const router = useRouter();
  const { user, login } = useAuth();
  const { favoriteIds } = useFavoritesContext();
  const { summary } = useCartContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [callbackModalOpen, setCallbackModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleAuthSuccess = (data: any) => {
    login(data.accessToken, data.refreshToken, data.user);
  };

  const handleAccountClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="hidden md:block lg:hidden sticky top-0 z-40 bg-white border-b">
        <div className="px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            {/* Left section */}
            <div className="flex items-center gap-4">
              {/* Menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Logo */}
              <Logo className="h-10 flex-shrink-0" width={160} height={40} />

              {/* Catalog button */}
              <Link
                href="/catalog"
                className="flex items-center gap-2 bg-aso-blue text-white px-4 py-2 rounded-lg hover:bg-aso-blue-dark"
              >
                <Bars3Icon className="h-5 w-5" />
                <span>Каталог</span>
              </Link>
            </div>

            {/* Search form */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск товаров..."
                  className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-aso-blue"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </form>

            {/* Right section */}
            <div className="flex items-center gap-2">
              {/* Phone */}
              <a
                href="tel:+71234567890"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <PhoneIcon className="h-5 w-5" />
                <span className="text-sm">+7 (123) 456-78-90</span>
              </a>

              {/* Favorites */}
              <Link
                href="/favorites"
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <HeartIcon className="h-6 w-6" />
                {favoriteIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoriteIds.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {summary && summary.totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-aso-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {summary.totalQuantity}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                href="/account"
                onClick={handleAccountClick}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <UserIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onCallbackClick={() => setCallbackModalOpen(true)}
      />
      
      <CallbackModal
        isOpen={callbackModalOpen}
        onClose={() => setCallbackModalOpen(false)}
      />
      
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}