"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  ShoppingCartIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  BuildingStorefrontIcon,
  ListBulletIcon,
  ArrowUpTrayIcon,
  CreditCardIcon,
  PlusIcon,
  TicketIcon,
} from "@heroicons/react/24/outline"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useNotifications } from "@/lib/contexts/NotificationContext"

const menuItems = [
  {
    href: "/panel",
    label: "Дашборд",
    icon: HomeIcon,
    exact: true,
  },
  {
    href: "/panel/products",
    label: "Товары",
    icon: CubeIcon,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/panel/categories",
    label: "Категории",
    icon: TagIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/panel/attributes",
    label: "Атрибуты",
    icon: ListBulletIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/panel/orders",
    label: "Заказы",
    icon: ShoppingCartIcon,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/panel/orders/new",
    label: "Новый заказ",
    icon: PlusIcon,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/panel/chats",
    label: "Чаты",
    icon: ChatBubbleLeftRightIcon,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/panel/users",
    label: "Пользователи",
    icon: UsersIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/panel/brands",
    label: "Бренды",
    icon: BuildingStorefrontIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/panel/vehicles/brands",
    label: "Марки авто",
    icon: TruckIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/panel/delivery-methods",
    label: "Методы доставки",
    icon: TruckIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/panel/payment-methods",
    label: "Методы оплаты",
    icon: CreditCardIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/panel/order-statuses",
    label: "Статусы заказов",
    icon: ListBulletIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/panel/promo-codes",
    label: "Промокоды",
    icon: TicketIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/panel/imports",
    label: "Импорт данных",
    icon: ArrowUpTrayIcon,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/panel/stats",
    label: "Статистика",
    icon: ChartBarIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/panel/settings",
    label: "Настройки",
    icon: CogIcon,
    roles: ["ADMIN", "MANAGER"],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { totalUnread } = useNotifications()

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const hasAccess = (roles?: string[]) => {
    if (!roles) return true
    return user?.role && roles.includes(user.role)
  }

  return (
    <div className="bg-gray-900 text-white w-64 space-y-6 py-7 px-2">
      <div className="flex items-center justify-center mb-6">
        <Link href="/panel" className="text-2xl font-semibold">
          АСО Магазин
        </Link>
      </div>

      <nav className="space-y-1">
        {menuItems.map(item => {
          if (!hasAccess(item.roles)) return null

          const Icon = item.icon
          const active = isActive(item.href, item.exact)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 py-2.5 px-4 rounded transition duration-200 ${
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}>
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.href === '/panel/chats' && totalUnread > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
