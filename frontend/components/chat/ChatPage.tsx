'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { chatApi } from '@/lib/api/chat';
import { chatSocket } from '@/lib/chat/socket';
import { useAnonymousToken } from '@/lib/hooks/useAnonymousToken';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useNotifications } from '@/lib/contexts/NotificationContext';
import type { Chat, ChatMessage } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ProductOfferCard } from './ProductOfferCard';

export function ChatPage() {
  const [chat, setChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const { token, userId: anonymousUserId } = useAnonymousToken();
  const { user: authUser } = useAuth();
  const { markAsRead, playNotificationSound } = useNotifications();
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chat) {
      scrollToBottom();
    }
  }, [chat?.messages]);

  // Focus input after sending message
  useEffect(() => {
    if (shouldFocusInput && !isSending) {
      messageInputRef.current?.focus();
      setShouldFocusInput(false);
    }
  }, [shouldFocusInput, isSending]);

  // Load chat and connect to socket on mount
  useEffect(() => {
    if (token && anonymousUserId) {
      // Connect to socket - use authenticated user ID if available, otherwise anonymous
      const socketUserId = authUser?.id || anonymousUserId;
      chatSocket.connect(undefined, socketUserId, 'customer');
      loadChat();
    }

    return () => {
      chatSocket.disconnect();
    };
  }, [token, anonymousUserId, authUser?.id]);

  useEffect(() => {
    if (chat) {
      // Mark chat as read when loaded
      console.log('Marking chat as read:', chat.id);
      markAsRead(chat.id);
      // Scroll to bottom
      setTimeout(scrollToBottom, 100);
    }
  }, [chat?.id]); // Only depend on chat.id since markAsRead is stable

  useEffect(() => {
    // Socket event listeners
    const handleNewMessage = (data: { chatId: string; message: ChatMessage }) => {
      console.log('Received new message on chat page:', data);
      
      // Ignore our own messages (we already added them when sending)
      const isOwnMessage = data.message.senderId === authUser?.id || 
                          data.message.senderId === anonymousUserId || 
                          data.message.senderId === chat?.anonymousUserId;
      
      if (isOwnMessage) {
        console.log('Ignoring own message from socket');
        return;
      }
      
      // Update messages if this is current chat
      if (chat && data.chatId === chat.id) {
        setChat((prev) => {
          if (!prev) return prev;
          
          // Check if message already exists to avoid duplicates
          const messageExists = prev.messages.some(msg => msg.id === data.message.id);
          if (messageExists) {
            console.log('Message already exists, skipping');
            return prev;
          }
          
          return {
            ...prev,
            messages: [...prev.messages, data.message],
          };
        });
        
        // Mark as read immediately since we're on the chat page
        console.log('Marking message as read immediately');
        markAsRead(data.chatId);
        // Send read notification to server
        chatSocket.markAsRead(data.chatId);
      }
      
      // Play notification sound
      playNotificationSound();
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
      // Check if this is not our own read event
      const isOwnRead = data.readerId === authUser?.id || 
                       data.readerId === anonymousUserId;
      
      if (chat && data.chatId === chat.id && !isOwnRead) {
        setChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((msg) => {
              // Mark message as read if it's our message (from any of our IDs)
              const isOurMessage = msg.senderId === authUser?.id || 
                                 msg.senderId === anonymousUserId || 
                                 msg.senderId === chat.anonymousUserId;
              
              return isOurMessage && !msg.isRead
                ? { ...msg, isRead: true, readAt: data.readAt }
                : msg;
            }),
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
  }, [chat?.id, anonymousUserId, authUser?.id]); // Depend on all user IDs

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
    if (!token || !anonymousUserId) {
      console.log('Skipping chat load - no token or anonymousUserId');
      return;
    }
    
    try {
      setIsLoading(true);
      const chats = await chatApi.getUserChats();
      
      if (chats.length > 0 && chats[0].isActive) {
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
        const sentMessage = await chatApi.sendMessage(chat.id, { content: message.trim() });
        
        // Add the sent message to chat immediately (don't wait for socket)
        // The socket event will be ignored for our own messages
        setChat((prev) => {
          if (!prev) return prev;
          
          // Check if message already exists (in case socket was faster)
          const messageExists = prev.messages.some(msg => msg.id === sentMessage.id);
          if (messageExists) {
            return prev;
          }
          
          return {
            ...prev,
            messages: [...prev.messages, sentMessage],
          };
        });
      }
      
      setMessage('');
      // Trigger focus restoration
      setShouldFocusInput(true);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = (msg: ChatMessage) => {
    // Check if message is from any of our IDs (authenticated or anonymous)
    const isMyMessage = msg.senderId === authUser?.id || 
                       msg.senderId === anonymousUserId || 
                       msg.senderId === chat?.anonymousUserId ||
                       msg.senderId === chat?.userId;
    const isSystem = msg.senderRole === 'system';

    // If message has an offer, render the offer card
    if (msg.offer) {
      return (
        <div
          key={msg.id}
          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4`}
        >
          <div className="max-w-[90%] md:max-w-[80%]">
            <ProductOfferCard offer={msg.offer} isMyMessage={isMyMessage} />
            <div className={`text-xs mt-1 px-2 flex items-center justify-between ${!isMyMessage ? 'text-gray-600' : 'text-gray-500'}`}>
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
    }

    return (
      <div
        key={msg.id}
        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[90%] md:max-w-[80%] rounded-lg px-4 py-2 ${
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

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col md:relative md:h-screen md:inset-auto" style={{ top: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="bg-white shadow-sm flex-shrink-0 pt-safe">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">Чат с экспертом</h1>
                <p className="text-sm text-gray-500">Мы онлайн и готовы помочь</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 container mx-auto px-0 md:px-4 md:py-6 flex flex-col max-w-4xl h-full">
          <div className="bg-white md:rounded-lg md:shadow-md flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
                <p className="mb-2 text-lg">Добро пожаловать!</p>
                <p className="text-sm">Задайте ваш вопрос, и наш эксперт поможет вам.</p>
              </div>
            )}
          </div>


          {/* Input */}
          <form onSubmit={sendMessage} className="border-t p-3 md:p-6 pb-safe flex-shrink-0 bg-white">
            <div className="flex items-center space-x-2 md:space-x-3 mb-env-safe" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 hidden"
                title="Прикрепить файл"
              >
                <Paperclip className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              <div className="flex-1">
                <textarea
                  ref={messageInputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  placeholder="Введите сообщение..."
                  className="w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  rows={2}
                  disabled={isSending}
                />
              </div>
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className="bg-blue-600 text-white rounded-lg px-4 py-2.5 md:px-6 md:py-3 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
              >
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}