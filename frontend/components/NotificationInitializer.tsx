'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/lib/contexts/NotificationContext';
import { useAnonymousToken } from '@/lib/hooks/useAnonymousToken';
import { usePathname } from 'next/navigation';
import { chatApi } from '@/lib/api/chat';

export function NotificationInitializer() {
  const { setUnreadCount } = useNotifications();
  const { token, userId } = useAnonymousToken();
  const pathname = usePathname();

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!token || !userId) return;

      try {
        const chats = await chatApi.getUserChats();
        
        // Clear all counts first
        chats.forEach(chat => {
          setUnreadCount(chat.id, 0);
        });
        
        // Set unread count for each chat
        chats.forEach(chat => {
          if (chat.unreadCount > 0) {
            setUnreadCount(chat.id, chat.unreadCount);
          }
        });
      } catch (error) {
        console.error('Failed to load unread counts:', error);
      }
    };

    // Load on mount
    loadUnreadCount();
    
    // Reload when returning from chat page
    if (pathname !== '/chat') {
      loadUnreadCount();
    }
  }, [token, userId, pathname, setUnreadCount]);

  return null;
}