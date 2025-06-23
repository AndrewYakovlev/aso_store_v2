'use client';

import Link from "next/link"
import { Logo } from "@/components/Logo"
import { usePathname } from 'next/navigation';
import { useStoreContacts } from '@/lib/contexts/StoreContactsContext';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';

export function Footer() {
  const pathname = usePathname();
  const { phones, mainAddress, mainPhone } = useStoreContacts();
  
  // Hide footer on chat page for mobile
  if (pathname === '/chat') {
    return null;
  }
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Add padding bottom on mobile for bottom navigation */}
      <div className="pb-16 md:pb-0">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Logo
                  variant="secondary"
                  className="h-12 filter"
                  width={48}
                  height={48}
                />
                <div>
                  <h3 className="text-white font-bold text-xl">АСО</h3>
                  <p className="text-xs">Магазин автозапчастей</p>
                </div>
              </div>
              <p className="text-sm mb-4">
                Интернет-магазин автозапчастей с доставкой по всей России
              </p>
              <div className="space-y-2 text-sm">
                {mainAddress && (
                  <p>
                    г. {mainAddress.city}, {mainAddress.street}, {mainAddress.building}
                    {mainAddress.office && `, офис ${mainAddress.office}`}
                  </p>
                )}
                {mainPhone && (
                  <div className="space-y-1">
                    <a href={`tel:${mainPhone.phone}`} className="hover:text-white block">
                      {formatPhoneForDisplay(mainPhone.phone)}
                    </a>
                    <div className="flex gap-2">
                      {mainPhone.isWhatsApp && (
                        <a
                          href={`https://wa.me/${mainPhone.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-400"
                          title="WhatsApp"
                        >
                          <FaWhatsapp className="w-4 h-4" />
                        </a>
                      )}
                      {mainPhone.isTelegram && (
                        <a
                          href={`https://t.me/${mainPhone.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-400"
                          title="Telegram"
                        >
                          <FaTelegram className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Information */}
            <div>
              <h3 className="text-white font-semibold mb-4">Информация</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white">
                    О компании
                  </Link>
                </li>
                <li>
                  <Link href="/delivery-and-payment" className="hover:text-white">
                    Доставка и оплата
                  </Link>
                </li>
                <li>
                  <Link href="/warranty" className="hover:text-white">
                    Гарантия и возврат
                  </Link>
                </li>
                <li>
                  <Link href="/sales-rules" className="hover:text-white">
                    Правила продаж
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">
                Правовая информация
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Политика конфиденциальности
                  </Link>
                </li>
                <li>
                  <Link href="/personal-data" className="hover:text-white">
                    Обработка персональных данных
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white">
                    Использование файлов cookie
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Пользовательское соглашение
                  </Link>
                </li>
              </ul>
            </div>

            {/* Payment & Social */}
            <div>
              <h3 className="text-white font-semibold mb-4">
                Принимаем к оплате
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="bg-white rounded px-3 py-2">
                  <span className="text-gray-800 text-xs font-medium">
                    VISA
                  </span>
                </div>
                <div className="bg-white rounded px-3 py-2">
                  <span className="text-gray-800 text-xs font-medium">
                    MasterCard
                  </span>
                </div>
                <div className="bg-white rounded px-3 py-2">
                  <span className="text-gray-800 text-xs font-medium">МИР</span>
                </div>
              </div>

              <h3 className="text-white font-semibold mb-4">Мы в соцсетях</h3>
              <div className="flex gap-3">
                <a
                  href="https://vk.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600">
                  <span className="sr-only">ВКонтакте</span>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.576-1.496c.588-.19 1.341 1.26 2.14 1.818.605.422 1.064.33 1.064.33l2.137-.03s1.117-.071.587-.964c-.043-.073-.308-.661-1.588-1.87-1.34-1.264-1.16-1.059.453-3.246.983-1.332 1.376-2.145 1.253-2.493-.117-.332-.84-.244-.84-.244l-2.406.015s-.178-.025-.31.056c-.13.079-.212.262-.212.262s-.382 1.03-.89 1.907c-1.07 1.85-1.499 1.948-1.674 1.832-.407-.267-.305-1.075-.305-1.648 0-1.793.267-2.54-.521-2.733-.262-.065-.454-.107-1.123-.114-.858-.009-1.585.003-1.996.208-.274.136-.485.44-.356.457.159.022.519.099.71.364.246.341.237 1.107.237 1.107s.142 2.11-.33 2.371c-.325.18-.77-.187-1.725-1.865-.489-.859-.859-1.81-.859-1.81s-.07-.176-.198-.272c-.154-.115-.37-.151-.37-.151l-2.286.015s-.343.01-.469.161c-.112.135-.009.413-.009.413s1.792 4.256 3.817 6.403c1.858 1.967 3.968 1.837 3.968 1.837h.957z" />
                  </svg>
                </a>
                {phones.some(p => p.isTelegram) && (
                  <a
                    href={`https://t.me/${phones.find(p => p.isTelegram)?.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600">
                    <span className="sr-only">Telegram</span>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.21 2.2-1.12 7.53-1.58 9.99-.19 1.04-.58 1.39-.95 1.42-.81.07-1.43-.53-2.22-1.04-1.23-.8-1.93-1.3-3.12-2.08-1.38-.91-.49-1.41.3-2.23.21-.21 3.82-3.5 3.89-3.8.01-.04.01-.19-.07-.27-.08-.08-.2-.05-.28-.03-.12.03-2.04 1.3-5.76 3.81-.55.38-1.04.56-1.49.55-.49-.01-1.43-.28-2.13-.51-.86-.28-1.54-.43-1.48-.91.03-.25.37-.51 1.02-.78 4.01-1.75 6.68-2.9 8.01-3.46 3.81-1.6 4.61-1.88 5.12-1.89.11 0 .37.03.53.18.14.12.18.28.2.46-.01.06.01.24 0 .38z" />
                    </svg>
                  </a>
                )}
                {phones.some(p => p.isWhatsApp) && (
                  <a
                    href={`https://wa.me/${phones.find(p => p.isWhatsApp)?.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600">
                    <span className="sr-only">WhatsApp</span>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>&copy; 2024 АСО. Все права защищены.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
