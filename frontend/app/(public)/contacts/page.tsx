'use client';

import { MapPinIcon, ClockIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useStoreContacts } from '@/lib/contexts/StoreContactsContext';
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';

export default function ContactsPage() {
  const { phones, addresses, loading } = useStoreContacts();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Контакты</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Phones Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <PhoneIcon className="h-6 w-6 text-aso-blue" />
            Телефоны
          </h2>
          
          {phones.length > 0 ? (
            <div className="space-y-4">
              {phones.map((phone) => (
                <div key={phone.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <a
                        href={`tel:${phone.phone}`}
                        className="text-lg font-medium text-aso-blue hover:text-aso-blue-dark"
                      >
                        {formatPhoneForDisplay(phone.phone)}
                      </a>
                      {phone.name && (
                        <p className="text-sm text-gray-600 mt-1">{phone.name}</p>
                      )}
                      {phone.isMain && (
                        <p className="text-xs text-gray-500 mt-1">Основной номер</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-2">
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
            </div>
          ) : (
            <p className="text-gray-500">Контактные телефоны временно недоступны</p>
          )}
        </div>

        {/* Addresses Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPinIcon className="h-6 w-6 text-aso-blue" />
            Адреса
          </h2>
          
          {addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium">
                    {address.name || (
                      address.type === 'main' ? 'Главный офис' :
                      address.type === 'warehouse' ? 'Склад' :
                      'Пункт самовывоза'
                    )}
                  </h3>
                  
                  <p className="text-gray-600 mt-2">
                    {address.country}, {address.postalCode && `${address.postalCode}, `}
                    г. {address.city}, {address.street}, д. {address.building}
                    {address.office && `, офис ${address.office}`}
                  </p>
                  
                  {address.workingHours && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      {address.workingHours}
                    </div>
                  )}
                  
                  {address.coordinates && (
                    <div className="mt-3">
                      <a
                        href={`https://maps.google.com/?q=${JSON.parse(address.coordinates).lat},${JSON.parse(address.coordinates).lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-aso-blue hover:text-aso-blue-dark"
                      >
                        Показать на карте →
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Адреса временно недоступны</p>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Дополнительная информация</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Реквизиты компании</h3>
            <p className="text-sm text-gray-600">
              АО "Бежецкий завод "АСО"<br />
              ИНН: 6906000113<br />
              КПП: 690601001<br />
              ОГРН: 1026901539720
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Email для связи</h3>
            <a
              href="mailto:info@aso-store.ru"
              className="flex items-center gap-2 text-aso-blue hover:text-aso-blue-dark"
            >
              <EnvelopeIcon className="h-5 w-5" />
              info@aso-store.ru
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}