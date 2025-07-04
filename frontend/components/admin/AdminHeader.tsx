'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useNotifications } from '@/lib/contexts/NotificationContext';
import Link from 'next/link';
import { ArrowLeftIcon, UserCircleIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { formatPhoneForDisplay } from '@/lib/utils/phone';

export function AdminHeader() {
  const { user, logout } = useAuth();
  const { soundEnabled, toggleSound } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Link 
            href="/" 
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mr-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Вернуться на сайт
          </Link>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={toggleSound}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title={soundEnabled ? 'Выключить звук уведомлений' : 'Включить звук уведомлений'}
          >
            {soundEnabled ? (
              <SpeakerWaveIcon className="h-5 w-5" />
            ) : (
              <SpeakerXMarkIcon className="h-5 w-5" />
            )}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <UserCircleIcon className="h-8 w-8 mr-2" />
              <span>{user?.firstName || (user?.phone ? formatPhoneForDisplay(user.phone) : 'Администратор')}</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium">{user?.firstName || 'Администратор'}</div>
                  <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
                <Link
                  href="/account"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Мой профиль
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}