'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface UnreadCount {
  chatId: string;
  count: number;
}

interface NotificationContextType {
  unreadCounts: Map<string, number>;
  totalUnread: number;
  soundEnabled: boolean;
  toggleSound: () => void;
  markAsRead: (chatId: string) => void;
  incrementUnread: (chatId: string) => void;
  setUnreadCount: (chatId: string, count: number) => void;
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const pathname = usePathname();

  // Load sound preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat_sound_enabled');
    if (saved !== null) {
      setSoundEnabled(saved === 'true');
    }
  }, []);

  // Calculate total unread
  const totalUnread = Array.from(unreadCounts.values()).reduce((sum, count) => sum + count, 0);

  // Update page title with unread count
  useEffect(() => {
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ${document.title.replace(/^\(\d+\) /, '')}`;
    } else {
      document.title = document.title.replace(/^\(\d+\) /, '');
    }
  }, [totalUnread]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem('chat_sound_enabled', String(newValue));
      return newValue;
    });
  }, []);

  const markAsRead = useCallback((chatId: string) => {
    setUnreadCounts((prev) => {
      const next = new Map(prev);
      next.delete(chatId);
      return next;
    });
  }, []);

  const incrementUnread = useCallback((chatId: string) => {
    setUnreadCounts((prev) => {
      const next = new Map(prev);
      const current = next.get(chatId) || 0;
      next.set(chatId, current + 1);
      return next;
    });
  }, []);

  const setUnreadCount = useCallback((chatId: string, count: number) => {
    setUnreadCounts((prev) => {
      const next = new Map(prev);
      if (count > 0) {
        next.set(chatId, count);
      } else {
        next.delete(chatId);
      }
      return next;
    });
  }, []);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && typeof window !== 'undefined') {
      // Create audio element and play notification sound
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch((e) => {
        console.warn('Could not play notification sound:', e);
      });
    }
  }, [soundEnabled]);

  // Clear unread count when visiting a chat
  useEffect(() => {
    const match = pathname.match(/\/chats\/([^\/]+)/);
    if (match) {
      const chatId = match[1];
      markAsRead(chatId);
    }
  }, [pathname, markAsRead]);

  const value: NotificationContextType = {
    unreadCounts,
    totalUnread,
    soundEnabled,
    toggleSound,
    markAsRead,
    incrementUnread,
    setUnreadCount,
    playNotificationSound,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}