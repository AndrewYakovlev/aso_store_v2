'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useStoreContacts } from '@/lib/contexts/StoreContactsContext';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallbackClick: () => void;
}

export function PhoneModal({ isOpen, onClose, onCallbackClick }: PhoneModalProps) {
  const { phones } = useStoreContacts();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-aso-blue focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Закрыть</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-aso-blue/10 sm:mx-0 sm:h-10 sm:w-10">
                    <PhoneIcon className="h-6 w-6 text-aso-blue" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Свяжитесь с нами
                    </Dialog.Title>
                    <div className="mt-4 space-y-4">
                      {phones.map((phone) => (
                        <div key={phone.id} className="space-y-1">
                          <a
                            href={`tel:${phone.phone}`}
                            className="flex items-center gap-2 text-lg font-medium text-aso-blue hover:text-aso-blue-dark"
                          >
                            <PhoneIcon className="h-5 w-5" />
                            {formatPhoneForDisplay(phone.phone)}
                          </a>
                          {phone.name && (
                            <p className="text-sm text-gray-500 ml-7">{phone.name}</p>
                          )}
                          <div className="flex gap-3 ml-7">
                            {phone.isWhatsApp && (
                              <a
                                href={`https://wa.me/${phone.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
                              >
                                <FaWhatsapp className="w-4 h-4" />
                                WhatsApp
                              </a>
                            )}
                            {phone.isTelegram && (
                              <a
                                href={`https://t.me/${phone.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                              >
                                <FaTelegram className="w-4 h-4" />
                                Telegram
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                      {phones.length === 0 && (
                        <p className="text-gray-500">Контактные телефоны временно недоступны</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-4">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-aso-blue px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-aso-blue-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aso-blue"
                    onClick={() => {
                      onCallbackClick();
                      onClose();
                    }}
                  >
                    Перезвоните мне
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}