'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { chatApi } from '@/lib/api/chat';
import { chatSocket } from '@/lib/chat/socket';
import type { ChatListItem, Chat } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { MessageCircle, User, Clock } from 'lucide-react';
import ChatWindow from '@/components/chat/ChatWindow';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useNotifications } from '@/lib/contexts/NotificationContext';
import { useActiveChat } from '@/lib/contexts/ActiveChatContext';

export default function AdminChatsPage() {
  const { accessToken, user } = useAuth();
  const { unreadCounts, setUnreadCount, incrementUnread, playNotificationSound } = useNotifications();
  const { setActiveChatId } = useActiveChat();
  const searchParams = useSearchParams();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !user) return;
    
    loadChats();

    // Listen for new chats and updates (socket is already connected in AdminNotificationListener)
    const handleNewChat = (chat: ChatListItem) => {
      setChats((prev) => [chat, ...prev]);
    };

    const handleChatUpdate = (data: { chatId: string; type: string }) => {
      if (data.type === 'new_message') {
        loadChats(); // Reload to get updated last message
      }
    };

    chatSocket.on('newChat', handleNewChat);
    chatSocket.on('chatUpdate', handleChatUpdate);

    return () => {
      chatSocket.off('newChat', handleNewChat);
      chatSocket.off('chatUpdate', handleChatUpdate);
      setActiveChatId(null); // Clear active chat when leaving the page
    };
  }, [accessToken, user, setActiveChatId]);

  // Handle chat parameter from URL
  useEffect(() => {
    const chatId = searchParams.get('chat');
    if (chatId && chats.length > 0) {
      selectChat(chatId);
    }
  }, [searchParams, chats]);

  const loadChats = async () => {
    if (!accessToken) return;
    
    try {
      setIsLoading(true);
      const data = await chatApi.getManagerChats(accessToken);
      setChats(data);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectChat = async (chatId: string) => {
    if (!accessToken) return;
    
    try {
      const chat = await chatApi.getChatById(chatId, accessToken);
      setSelectedChat(chat);
      setActiveChatId(chatId);
      
      // Mark messages as read
      await chatApi.markMessagesAsRead(chatId, accessToken);
      
      // Update local state
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const renderChatItem = (chat: ChatListItem) => {
    const hasUnread = chat.unreadCount > 0;
    
    return (
      <div
        key={chat.id}
        onClick={() => selectChat(chat.id)}
        className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
          selectedChat?.id === chat.id ? 'bg-blue-50' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <User className="h-4 w-4 mr-1 text-gray-500" />
              <span className="font-medium text-sm">
                {chat.customerName || 'Анонимный пользователь'}
              </span>
              {chat.customerPhone && (
                <span className="text-xs text-gray-500 ml-2">{chat.customerPhone}</span>
              )}
            </div>
            
            {chat.lastMessage && (
              <p className="text-sm text-gray-600 truncate">
                {chat.lastMessage.content}
              </p>
            )}
            
            <div className="flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(chat.updatedAt), {
                  addSuffix: true,
                  locale: ru,
                })}
              </span>
            </div>
          </div>
          
          {hasUnread && (
            <div className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
              {chat.unreadCount}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Chat list */}
      <div className="w-80 border-r bg-white overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Чаты с клиентами
          </h2>
        </div>
        
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Загрузка...</div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Нет активных чатов</div>
        ) : (
          <div>
            {chats.map(renderChatItem)}
          </div>
        )}
      </div>

      {/* Chat window */}
      <div className="flex-1">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            isManager
            onChatUpdate={(updatedChat) => setSelectedChat(updatedChat)}
            onClose={() => {
              setSelectedChat(null);
              setActiveChatId(null);
              loadChats();
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Выберите чат для просмотра
          </div>
        )}
      </div>
    </div>
  );
}