'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { chatApi } from '@/lib/api/chat';
import { chatSocket } from '@/lib/chat/socket';
import { useAnonymousToken } from '@/lib/hooks/useAnonymousToken';
import { useNotifications } from '@/lib/contexts/NotificationContext';
import type { ChatMessage } from '@/types/chat';

export function ChatFloatingButton() {
  const [isShaking, setIsShaking] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { token, userId } = useAnonymousToken();
  const { unreadCounts, incrementUnread, playNotificationSound, setUnreadCount } = useNotifications();

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Load chat ID and connect to socket on mount
  useEffect(() => {
    if (token && userId) {
      // Connect to socket to receive messages
      chatSocket.connect(undefined, userId, 'customer');
      loadChatId();

      // Periodically check for new messages (every 30 seconds)
      const interval = setInterval(() => {
        if (pathname !== '/chat') {
          loadChatId();
        }
      }, 30000);

      return () => {
        clearInterval(interval);
        chatSocket.disconnect();
      };
    }
  }, [token, userId, pathname]);

  useEffect(() => {
    // Socket event listeners
    const handleNewMessage = (data: { chatId: string; message: ChatMessage }) => {
      console.log('Received new message in floating button:', data);
      
      // Update chatId if we don't have it yet
      if (!chatId && data.chatId) {
        setChatId(data.chatId);
      }
      
      // Play notification sound and increment unread if message is not from current user
      if (data.message.senderId !== userId && pathname !== '/chat') {
        playNotificationSound();
        incrementUnread(data.chatId);
        triggerShake();
      }
    };

    const handleNewChat = (chat: any) => {
      console.log('Received new chat in floating button:', chat);
      if (chat.id) {
        setChatId(chat.id);
        // If there's an initial message from manager, show notification
        if (chat.messages?.length > 0 && chat.messages[0].senderId !== userId) {
          playNotificationSound();
          incrementUnread(chat.id);
          triggerShake();
        }
      }
    };

    chatSocket.on('newMessage', handleNewMessage);
    chatSocket.on('newChat', handleNewChat);

    return () => {
      chatSocket.off('newMessage', handleNewMessage);
      chatSocket.off('newChat', handleNewChat);
    };
  }, [userId, chatId, pathname, incrementUnread, playNotificationSound]);

  // Join chat room when chat ID is loaded
  useEffect(() => {
    if (chatId) {
      chatSocket.joinChat(chatId);
      return () => {
        chatSocket.leaveChat(chatId);
      };
    }
  }, [chatId]);

  const loadChatId = async () => {
    // Don't try to load if we don't have a token
    if (!token || !userId) {
      console.log('Skipping chat load - no token or userId');
      return;
    }
    
    try {
      const chats = await chatApi.getUserChats();
      console.log('Loaded chats in floating button:', chats);
      
      if (chats.length > 0 && chats[0].isActive) {
        setChatId(chats[0].id);
        
        // Set unread count from chat list
        if (chats[0].unreadCount > 0) {
          console.log('Setting unread count:', chats[0].id, chats[0].unreadCount);
          setUnreadCount(chats[0].id, chats[0].unreadCount);
        }
      }
    } catch (error) {
      console.error('Failed to load chat ID:', error);
    }
  };

  const handleClick = () => {
    router.push('/chat');
  };

  // Get total unread count
  const totalUnread = Array.from(unreadCounts.values()).reduce((sum, count) => sum + count, 0);

  // Don't show button on chat page
  if (pathname === '/chat') {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 bg-aso-blue text-white rounded-full p-4 shadow-lg hover:bg-aso-blue-dark transition-colors z-50 ${isShaking ? 'animate-shake' : ''}`}
    >
      <MessageCircle className="h-6 w-6" />
      {totalUnread > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
          {totalUnread > 99 ? '99+' : totalUnread}
        </span>
      )}
    </button>
  );
}