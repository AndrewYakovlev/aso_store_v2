"use client";

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/lib/hooks/usePushNotifications';

interface NotificationPermissionProps {
  onClose?: () => void;
  autoShow?: boolean;
}

export function NotificationPermission({ onClose, autoShow = true }: NotificationPermissionProps) {
  const { isSupported, permission, isSubscribed, isLoading, error, subscribe } = usePushNotifications();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const wasDismissed = localStorage.getItem('notification-permission-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Show banner if notifications are supported and not yet granted
    if (autoShow && isSupported && permission === 'default' && !isSubscribed) {
      // Delay showing banner to avoid overwhelming the user
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, isSubscribed, autoShow]);

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('notification-permission-dismissed', 'true');
    onClose?.();
  };

  const handleSubscribe = async () => {
    await subscribe();
    if (!error) {
      setShowBanner(false);
      onClose?.();
    }
  };

  if (!isSupported || !showBanner || dismissed || permission === 'denied' || isSubscribed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white shadow-lg rounded-lg p-4 border border-gray-200 z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Bell className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            Включить уведомления?
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Получайте уведомления о новых сообщениях и предложениях от менеджеров, даже когда браузер закрыт.
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Настройка...' : 'Включить'}
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Не сейчас
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function NotificationPermissionButton() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  if (permission === 'denied') {
    return (
      <button
        disabled
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed"
        title="Уведомления заблокированы в настройках браузера"
      >
        <Bell className="h-4 w-4 mr-1.5" />
        Уведомления заблокированы
      </button>
    );
  }

  if (isSubscribed) {
    return (
      <button
        onClick={unsubscribe}
        disabled={isLoading}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <Bell className="h-4 w-4 mr-1.5" />
        {isLoading ? 'Отключение...' : 'Отключить уведомления'}
      </button>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={isLoading}
      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      <Bell className="h-4 w-4 mr-1.5" />
      {isLoading ? 'Настройка...' : 'Включить уведомления'}
    </button>
  );
}