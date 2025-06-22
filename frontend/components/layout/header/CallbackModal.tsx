'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { formatPhoneForDisplay, normalizePhone } from '@/lib/utils/phone';

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CallbackModal({ isOpen, onClose }: CallbackModalProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;

    setLoading(true);
    try {
      // TODO: Implement API call for callback request
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setPhone('');
        setName('');
      }, 2000);
    } catch (error) {
      console.error('Failed to send callback request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setPhone(value);
    }
  };

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-aso-blue focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Закрыть</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {success ? (
                  <div className="text-center py-8">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Заявка отправлена!</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Мы перезвоним вам в ближайшее время
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                        Заказать обратный звонок
                      </Dialog.Title>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="callback-name" className="block text-sm font-medium text-gray-700">
                          Ваше имя
                        </label>
                        <input
                          type="text"
                          id="callback-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-aso-blue focus:ring-aso-blue sm:text-sm"
                          placeholder="Иван"
                        />
                      </div>

                      <div>
                        <label htmlFor="callback-phone" className="block text-sm font-medium text-gray-700">
                          Телефон *
                        </label>
                        <input
                          type="tel"
                          id="callback-phone"
                          value={formatPhoneForDisplay(phone)}
                          onChange={handlePhoneChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-aso-blue focus:ring-aso-blue sm:text-sm"
                          placeholder="+7 (999) 123-45-67"
                          required
                        />
                      </div>

                      <p className="text-xs text-gray-500">
                        Нажимая кнопку, вы соглашаетесь с{' '}
                        <a href="/privacy" className="text-aso-blue hover:underline">
                          политикой конфиденциальности
                        </a>
                      </p>

                      <button
                        type="submit"
                        disabled={loading || phone.length < 10}
                        className="w-full inline-flex justify-center rounded-md bg-aso-blue px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-aso-blue-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aso-blue disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Отправка...' : 'Перезвоните мне'}
                      </button>
                    </form>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}