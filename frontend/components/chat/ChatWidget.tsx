'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Paperclip } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { chatSocket } from '@/lib/chat/socket';
import { useAnonymousToken } from '@/lib/hooks/useAnonymousToken';
import { useNotifications } from '@/lib/contexts/NotificationContext';
import type { Chat, ChatMessage } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token, userId } = useAnonymousToken();
  const { unreadCounts, markAsRead, incrementUnread, setUnreadCount, playNotificationSound } = useNotifications();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  useEffect(() => {
    if (chat) {
      scrollToBottom();
    }
  }, [chat?.messages]);

  // Load chat and connect to socket on mount
  useEffect(() => {
    if (token && userId) {
      // Connect to socket to receive messages even when widget is closed
      chatSocket.connect(undefined, userId, 'customer');
      loadChat();
    }

    return () => {
      chatSocket.disconnect();
    };
  }, [token, userId]);

  useEffect(() => {
    if (isOpen && chat) {
      // Mark chat as read when opened
      markAsRead(chat.id);
      // Scroll to bottom when opening
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, chat]);

  useEffect(() => {
    // Socket event listeners
    const handleNewMessage = (data: { chatId: string; message: ChatMessage }) => {
      console.log('Received new message:', data);
      
      // Update messages if this is current chat
      if (chat && data.chatId === chat.id) {
        setChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, data.message],
          };
        });
      }
      
      // Play notification sound and increment unread if message is not from current user
      if (data.message.senderId !== userId) {
        playNotificationSound();
        if (!isOpen) {
          incrementUnread(data.chatId);
          triggerShake();
        }
      }
    };

    const handleMessageDelivered = (data: { chatId: string; messageId: string; deliveredAt: string }) => {
      if (chat && data.chatId === chat.id) {
        setChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.id === data.messageId
                ? { ...msg, isDelivered: true, deliveredAt: data.deliveredAt }
                : msg
            ),
          };
        });
      }
    };

    const handleMessagesRead = (data: { chatId: string; readerId: string; readAt: string }) => {
      if (chat && data.chatId === chat.id && data.readerId !== userId) {
        setChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.senderId === userId && !msg.isRead
                ? { ...msg, isRead: true, readAt: data.readAt }
                : msg
            ),
          };
        });
      }
    };

    chatSocket.on('newMessage', handleNewMessage);
    chatSocket.on('messageDelivered', handleMessageDelivered);
    chatSocket.on('messagesRead', handleMessagesRead);

    return () => {
      chatSocket.off('newMessage', handleNewMessage);
      chatSocket.off('messageDelivered', handleMessageDelivered);
      chatSocket.off('messagesRead', handleMessagesRead);
    };
  }, [chat, userId, isOpen, incrementUnread, playNotificationSound, triggerShake]);

  // Join/leave chat room when chat changes
  useEffect(() => {
    if (chat) {
      chatSocket.joinChat(chat.id);
      return () => {
        chatSocket.leaveChat(chat.id);
      };
    }
  }, [chat?.id]);

  const loadChat = async () => {
    // Don't try to load if we don't have a token
    if (!token || !userId) {
      console.log('Skipping chat load - no token or userId');
      return;
    }
    
    try {
      setIsLoading(true);
      const chats = await chatApi.getUserChats();
      
      if (chats.length > 0 && chats[0].isActive) {
        // Set unread count from chat list
        if (chats[0].unreadCount > 0 && !isOpen) {
          setUnreadCount(chats[0].id, chats[0].unreadCount);
        }
        
        // Load existing chat
        const fullChat = await chatApi.getChatById(chats[0].id);
        setChat(fullChat);
      } else {
        // Chat will be created on first message
        setChat(null);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    try {
      setIsSending(true);
      
      if (!chat) {
        // Create new chat with first message
        const newChat = await chatApi.createChat({ message: message.trim() });
        setChat(newChat);
      } else {
        // Send message to existing chat
        await chatApi.sendMessage(chat.id, { content: message.trim() });
      }
      
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = (msg: ChatMessage) => {
    const isMyMessage = msg.senderId === userId || msg.senderId === chat?.anonymousUserId;
    const isSystem = msg.senderRole === 'system';

    return (
      <div
        key={msg.id}
        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 ${
            isSystem
              ? 'bg-gray-100 text-gray-600 text-sm italic'
              : isMyMessage
              ? 'bg-gray-200 text-gray-900'
              : 'bg-blue-600 text-white'
          }`}
        >
          {!isSystem && (
            <div className="text-xs opacity-70 mb-1">
              {msg.senderName}
            </div>
          )}
          <div className="whitespace-pre-wrap">{msg.content}</div>
          <div className={`text-xs mt-1 flex items-center justify-between ${!isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
            <span>
              {formatDistanceToNow(new Date(msg.createdAt), {
                addSuffix: true,
                locale: ru,
              })}
            </span>
            {isMyMessage && !isSystem && (
              <span className="ml-2">
                {msg.isRead ? (
                  <span title={`Прочитано ${msg.readAt ? formatDistanceToNow(new Date(msg.readAt), { addSuffix: true, locale: ru }) : ''}`}>✓✓</span>
                ) : msg.isDelivered ? (
                  <span title={`Доставлено ${msg.deliveredAt ? formatDistanceToNow(new Date(msg.deliveredAt), { addSuffix: true, locale: ru }) : ''}`}>✓</span>
                ) : (
                  <span title="Отправляется...">○</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Get unread count for current chat
  const unreadCount = chat ? unreadCounts.get(chat.id) || 0 : 0;

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => {
          setIsOpen(true);
          if (chat) {
            markAsRead(chat.id);
          }
        }}
        className={`fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-50 ${isShaking ? 'animate-shake' : ''}`}
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-[60]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-semibold text-lg">Чат с экспертом</h3>
              <p className="text-sm text-gray-500">Мы онлайн и готовы помочь</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Загрузка...</div>
              </div>
            ) : chat?.messages.length ? (
              <>
                {chat.messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                <p className="mb-2">Добро пожаловать!</p>
                <p className="text-sm">Задайте ваш вопрос, и наш эксперт поможет вам.</p>
              </div>
            )}
          </div>

          {/* Product offers */}
          {chat && chat.offers.filter((o) => o.isActive).length > 0 && (
            <div className="border-t p-4 bg-gray-50">
              <p className="text-sm font-medium mb-2">Товарные предложения:</p>
              <div className="space-y-2">
                {chat.offers
                  .filter((o) => o.isActive)
                  .map((offer) => (
                    <div key={offer.id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{offer.name}</p>
                          {offer.description && (
                            <p className="text-sm text-gray-600">{offer.description}</p>
                          )}
                        </div>
                        <p className="font-bold text-green-600">
                          {offer.price.toLocaleString()} ₽
                        </p>
                      </div>
                      <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                        Добавить в корзину
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t p-4">
            <div className="flex items-end space-x-2">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 mb-1"
                title="Прикрепить файл"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  placeholder="Введите сообщение..."
                  className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  disabled={isSending}
                />
              </div>
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-1"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}