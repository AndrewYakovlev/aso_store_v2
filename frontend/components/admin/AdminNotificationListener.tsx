'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { chatSocket } from '@/lib/chat/socket';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useNotifications } from '@/lib/contexts/NotificationContext';
import { useActiveChat } from '@/lib/contexts/ActiveChatContext';
import { chatApi } from '@/lib/api/chat';
import { toast } from 'sonner';

export function AdminNotificationListener() {
  const { user, accessToken } = useAuth();
  const { setUnreadCount, incrementUnread, playNotificationSound } = useNotifications();
  const { activeChatId } = useActiveChat();
  const router = useRouter();

  useEffect(() => {
    if (!user || !accessToken) return;
    
    // Only for managers and admins
    if (user.role !== 'MANAGER' && user.role !== 'ADMIN') return;

    // Connect to socket as manager
    chatSocket.connect(user.id, undefined, user.role, accessToken);

    // Load initial unread counts
    loadUnreadCounts();

    // Listen for new chats
    const handleNewChat = (chat: any) => {
      playNotificationSound();
      if (chat.unreadCount > 0) {
        setUnreadCount(chat.id, chat.unreadCount);
      }
      
      // Show toast notification only if not already viewing this chat
      if (activeChatId !== chat.id) {
        toast('Новый чат', {
          description: `${chat.customerName || 'Анонимный пользователь'}: ${chat.lastMessage?.content || 'Начал чат'}`,
          action: {
            label: 'Открыть',
            onClick: () => router.push(`/panel/chats?chat=${chat.id}`),
          },
        });
      }
    };

    // Listen for new messages
    const handleChatUpdate = (data: { chatId: string; type: string; message?: any }) => {
      if (data.type === 'new_message' && data.message) {
        // Don't play sound for own messages
        if (data.message.senderId !== user.id) {
          // Always play sound for new messages
          playNotificationSound();
          
          // Only increment unread and show toast if not viewing this chat
          if (activeChatId !== data.chatId) {
            incrementUnread(data.chatId);
            
            // Show toast notification
            const senderName = data.message.senderName || 'Клиент';
            const messagePreview = data.message.content.length > 50 
              ? data.message.content.substring(0, 50) + '...'
              : data.message.content;
              
            toast(`Новое сообщение от ${senderName}`, {
              description: messagePreview,
              action: {
                label: 'Открыть чат',
                onClick: () => router.push(`/panel/chats?chat=${data.chatId}`),
              },
            });
          }
        }
      }
    };

    chatSocket.on('newChat', handleNewChat);
    chatSocket.on('chatUpdate', handleChatUpdate);

    return () => {
      chatSocket.off('newChat', handleNewChat);
      chatSocket.off('chatUpdate', handleChatUpdate);
      chatSocket.disconnect();
    };
  }, [user, accessToken, setUnreadCount, incrementUnread, playNotificationSound, router, activeChatId]);

  const loadUnreadCounts = async () => {
    if (!accessToken) return;
    
    try {
      const chats = await chatApi.getManagerChats(accessToken);
      
      // Update unread counts for all chats
      chats.forEach((chat) => {
        if (chat.unreadCount > 0) {
          setUnreadCount(chat.id, chat.unreadCount);
        }
      });
    } catch (error) {
      console.error('Failed to load unread counts:', error);
    }
  };

  return null;
}