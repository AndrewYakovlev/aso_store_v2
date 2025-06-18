'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from './Logo'
import { AuthModal } from './auth/AuthModal'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useFavoritesContext } from '@/lib/contexts/FavoritesContext'
import { useCartContext } from '@/lib/contexts/CartContext'
import {
  Bars3Icon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
  HeartIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'

export function Header() {
  const router = useRouter()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, login } = useAuth()
  const { favoriteIds } = useFavoritesContext()
  const { summary } = useCartContext()

  const handleAuthSuccess = (data: any) => {
    login(data.accessToken, data.refreshToken, data.user)
  }

  const handleAccountClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      setAuthModalOpen(true)
    }
  }

  return (
    <>
      {/* Верхняя строка для десктопа */}
      <div className="hidden lg:block bg-gray-100 border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-2 text-sm">
            {/* Левое меню */}
            <nav className="flex gap-6">
              <Link href="/promo" className="hover:text-blue-600">Акции</Link>
              <Link href="/about" className="hover:text-blue-600">О компании</Link>
              <Link href="/payment" className="hover:text-blue-600">Оплата</Link>
              <Link href="/delivery" className="hover:text-blue-600">Доставка и самовывоз</Link>
              <Link href="/bonus" className="hover:text-blue-600">Бонусы</Link>
              <Link href="/vacancy" className="hover:text-blue-600">Вакансии</Link>
              <Link href="/contacts" className="hover:text-blue-600">Контакты</Link>
            </nav>
            {/* Телефоны */}
            <div className="flex gap-4">
              <a href="tel:+71234567890" className="hover:text-blue-600">+7 (123) 456-78-90</a>
              <a href="tel:+70987654321" className="hover:text-blue-600">+7 (098) 765-43-21</a>
            </div>
          </div>
        </div>
      </div>

      {/* Основная шапка */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-4">
            {/* Левая часть */}
            <div className="flex items-center gap-4">
              {/* Кнопка меню для мобильных и планшетов */}
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              {/* Логотип */}
              <Logo className="h-8 md:h-10" width={160} height={40} />
              
              {/* Кнопки Каталог и Подбор по авто для десктопа */}
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/catalog"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Bars3Icon className="w-5 h-5" />
                  <span>Каталог</span>
                </Link>
                <Link
                  href="/vehicles"
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
                >
                  <TruckIcon className="w-5 h-5" />
                  <span>Подбор по авто</span>
                </Link>
              </div>

              {/* Адрес для планшета */}
              <div className="hidden md:flex lg:hidden items-center gap-2 text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4" />
                <span>ул. Автозапчастей, 15</span>
              </div>
            </div>

            {/* Поисковая форма для десктопа - теперь в центре и занимает всё доступное место */}
            <form 
              className="hidden lg:flex flex-1 mx-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                }
              }}
            >
              <div className="relative w-full">
                <input
                  type="search"
                  placeholder="Поиск по каталогу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </form>

            {/* Правая часть */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Кнопка телефона - только для планшетов и мобильных */}
              <Link
                href="tel:+71234567890"
                className="flex lg:hidden items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <PhoneIcon className="w-6 h-6" />
                <span className="hidden md:inline text-sm">+7 (123) 456-78-90</span>
              </Link>

              {/* Избранное - только десктоп */}
              <Link
                href="/favorites"
                className="hidden lg:flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <HeartIcon className="w-6 h-6" />
                {favoriteIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoriteIds.length}
                  </span>
                )}
              </Link>

              {/* Личный кабинет */}
              <Link
                href="/account"
                onClick={handleAccountClick}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <UserIcon className="w-6 h-6" />
                <span className="hidden lg:inline text-sm">
                  {user ? user.firstName || 'Кабинет' : 'Войти'}
                </span>
              </Link>

              {/* Корзина - только десктоп */}
              <Link
                href="/cart"
                className="hidden lg:flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <ShoppingCartIcon className="w-6 h-6" />
                <span className="text-sm">Корзина</span>
                {/* Счетчик товаров */}
                {summary && summary.totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {summary.totalQuantity}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
        
        {/* Поисковая форма для мобильных устройств */}
        <div className="lg:hidden border-t">
          <form 
            className="p-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (searchQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
              }
            }}
          >
            <div className="relative">
              <input
                type="search"
                placeholder="Поиск по каталогу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}