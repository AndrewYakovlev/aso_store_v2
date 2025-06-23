'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useStoreContacts } from '@/lib/contexts/StoreContactsContext';
import { formatPhoneForDisplay } from '@/lib/utils/phone';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCallbackClick: () => void;
}

export function MobileMenu({ isOpen, onClose, onCallbackClick }: MobileMenuProps) {
  const { phones, mainAddress } = useStoreContacts();
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
                        {mainAddress && (
                          <div className="flex items-start gap-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Наш адрес</p>
                              <p className="text-sm text-gray-600">
                                г. {mainAddress.city}, {mainAddress.street}, д. {mainAddress.building}
                                {mainAddress.office && `, офис ${mainAddress.office}`}
                              </p>
                              {mainAddress.workingHours && (
                                <p className="text-xs text-gray-500 mt-1">{mainAddress.workingHours}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Phones */}
                        {phones.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="h-5 w-5 text-gray-400" />
                              <p className="text-sm font-medium">Наши телефоны</p>
                            </div>
                            <div className="space-y-3">
                              {phones.map((phone) => (
                                <div key={phone.id} className="ml-7">
                                  <a
                                    href={`tel:${phone.phone}`}
                                    className="text-lg font-medium text-aso-blue hover:text-aso-blue-dark"
                                  >
                                    {formatPhoneForDisplay(phone.phone)}
                                  </a>
                                  {phone.name && (
                                    <p className="text-sm text-gray-600">{phone.name}</p>
                                  )}
                                  {(phone.isWhatsApp || phone.isTelegram) && (
                                    <div className="flex gap-3 mt-1">
                                      {phone.isWhatsApp && (
                                        <a
                                          href={`https://wa.me/${phone.phone.replace(/\D/g, '')}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-green-600 hover:text-green-700"
                                        >
                                          WhatsApp
                                        </a>
                                      )}
                                      {phone.isTelegram && (
                                        <a
                                          href={`https://t.me/${phone.phone.replace(/\D/g, '')}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:text-blue-700"
                                        >
                                          Telegram
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
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
                        )}

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