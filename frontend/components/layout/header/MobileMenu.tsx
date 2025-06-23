'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCallbackClick: () => void;
}

export function MobileMenu({ isOpen, onClose, onCallbackClick }: MobileMenuProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-xs">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 border-b">
                      <h2 className="text-lg font-semibold">Меню</h2>
                      <button
                        type="button"
                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-aso-blue"
                        onClick={onClose}
                      >
                        <span className="sr-only">Закрыть меню</span>
                        <XMarkIcon className="h-8 w-8" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="px-4 py-6 space-y-6">
                        {/* Address */}
                        <div className="flex items-start gap-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Наш адрес</p>
                            <p className="text-sm text-gray-600">г. Москва, ул. Автозапчастей, 15</p>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                          <a
                            href="tel:+71234567890"
                            className="flex items-center gap-3 text-aso-blue hover:text-aso-blue-dark"
                          >
                            <PhoneIcon className="h-5 w-5" />
                            <span className="text-lg font-medium">+7 (123) 456-78-90</span>
                          </a>
                          <button
                            onClick={() => {
                              onCallbackClick();
                              onClose();
                            }}
                            className="w-full bg-aso-blue text-white py-2 px-4 rounded-lg hover:bg-aso-blue-dark transition-colors"
                          >
                            Перезвоните мне
                          </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="space-y-1">
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">
                            Информация
                          </h3>
                          <Link
                            href="/about"
                            className="block py-2 text-gray-700 hover:text-aso-blue"
                            onClick={onClose}
                          >
                            О компании
                          </Link>
                          <Link
                            href="/delivery-and-payment"
                            className="block py-2 text-gray-700 hover:text-aso-blue"
                            onClick={onClose}
                          >
                            Доставка и оплата
                          </Link>
                          <Link
                            href="/warranty"
                            className="block py-2 text-gray-700 hover:text-aso-blue"
                            onClick={onClose}
                          >
                            Гарантия и возврат
                          </Link>
                          <Link
                            href="/contacts"
                            className="block py-2 text-gray-700 hover:text-aso-blue"
                            onClick={onClose}
                          >
                            Контакты
                          </Link>
                        </nav>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}