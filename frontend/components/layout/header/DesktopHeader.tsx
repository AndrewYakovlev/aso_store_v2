'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useFavoritesContext } from '@/lib/contexts/FavoritesContext';
import { useCartContext } from '@/lib/contexts/CartContext';
import { useStoreContacts } from '@/lib/contexts/StoreContactsContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import {
  Bars3Icon,
  TruckIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  CogIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

export function DesktopHeader() {
  const router = useRouter();
  const { user, login } = useAuth();
  const { favoriteIds } = useFavoritesContext();
  const { summary } = useCartContext();
  const { phones, mainAddress, loading: contactsLoading } = useStoreContacts();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setShowTopBar(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setShowTopBar(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
      <div className="hidden lg:block">
        {/* Top bar */}
        <div 
          className={`
            bg-gray-100 border-b transition-transform duration-300
            ${showTopBar ? 'translate-y-0' : '-translate-y-full'}
          `}
        >
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-2 text-sm">
              {/* Left menu */}
              <nav className="flex gap-6">
                <Link href="/about" className="hover:text-aso-blue transition-colors">
                  О компании
                </Link>
                <Link href="/delivery-and-payment" className="hover:text-aso-blue transition-colors">
                  Доставка и оплата
                </Link>
                <Link href="/warranty" className="hover:text-aso-blue transition-colors">
                  Гарантия и возврат
                </Link>
                <Link href="/contacts" className="hover:text-aso-blue transition-colors">
                  Контакты
                </Link>
              </nav>
              
              {/* Right info */}
              <div className="flex items-center gap-6">
                {mainAddress && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="h-4 w-4" />
                    <span>
                      г. {mainAddress.city}, {mainAddress.street}, {mainAddress.building}
                      {mainAddress.office && `, офис ${mainAddress.office}`}
                    </span>
                  </div>
                )}
                {phones.length > 0 && (
                  <div className="flex items-center gap-4">
                    <PhoneIcon className="h-4 w-4 text-gray-600" />
                    {phones.slice(0, 2).map((phone, index) => (
                      <div key={phone.id} className="flex items-center">
                        {index > 0 && <span className="text-gray-400 mx-2">|</span>}
                        <a
                          href={`tel:${phone.phone}`}
                          className="hover:text-aso-blue transition-colors"
                          title={phone.name || undefined}
                        >
                          {formatPhoneForDisplay(phone.phone)}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <header 
          className={`
            bg-white border-b sticky z-40 transition-all duration-300
            ${showTopBar ? 'top-[41px]' : 'top-0'}
          `}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-6 py-4">
              {/* Left section */}
              <div className="flex items-center gap-4">
                {/* Logo */}
                <Logo className="flex-shrink-0" width={160} height={50} />

                {/* Catalog button */}
                <Link
                  href="/catalog"
                  className="flex items-center gap-2 bg-aso-blue text-white px-4 h-[42px] rounded-lg hover:bg-aso-blue-dark transition-colors"
                >
                  <Bars3Icon className="h-5 w-5" />
                  <span>Каталог</span>
                </Link>

                {/* Vehicle selection */}
                <Link
                  href="/vehicles"
                  className="flex items-center gap-2 bg-aso-orange text-white px-3 h-[42px] rounded-lg hover:bg-aso-orange-dark transition-colors"
                >
                  <TruckIcon className="h-5 w-5" />
                  <span>Подбор по авто</span>
                </Link>
              </div>

              {/* Search form */}
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по каталогу..."
                    className="w-full px-4 h-[42px] pr-10 border rounded-lg focus:outline-none focus:border-aso-blue"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </form>

              {/* Right section */}
              <div className="flex items-center gap-2">
                {/* Favorites */}
                <Link
                  href="/favorites"
                  className="flex items-center gap-2 px-3 h-[42px] hover:bg-gray-100 rounded-lg relative"
                >
                  <HeartIcon className="h-5 w-5" />
                  <span className="text-sm">Избранное</span>
                  {favoriteIds.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                      {favoriteIds.length}
                    </span>
                  )}
                </Link>

                {/* Admin panel */}
                {user && (user.role === 'ADMIN' || user.role === 'MANAGER') && (
                  <Link
                    href="/panel"
                    className="flex items-center gap-2 px-3 h-[42px] hover:bg-gray-100 rounded-lg text-red-600"
                  >
                    <CogIcon className="h-5 w-5" />
                    <span className="text-sm">Админка</span>
                  </Link>
                )}

                {/* Account */}
                <Link
                  href="/account"
                  onClick={handleAccountClick}
                  className="flex items-center gap-2 px-3 h-[42px] hover:bg-gray-100 rounded-lg"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="text-sm">
                    {user ? user.firstName || 'Кабинет' : 'Войти'}
                  </span>
                </Link>

                {/* Cart */}
                <Link
                  href="/cart"
                  className="flex items-center gap-2 px-3 h-[42px] hover:bg-gray-100 rounded-lg relative"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span className="text-sm">Корзина</span>
                  {summary && summary.totalQuantity > 0 && (
                    <span className="absolute -top-2 -right-2 bg-aso-blue text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                      {summary.totalQuantity}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}