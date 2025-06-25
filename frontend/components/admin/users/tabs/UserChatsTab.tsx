'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api/users';
import { useAuth } from '@/lib/contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface UserChatsTabProps {
  userId: string;
}

interface UserChat {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  messagesCount: number;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  manager?: {
    firstName: string;
    lastName?: string;
  };
}

export function UserChatsTab({ userId }: UserChatsTabProps) {
  const { accessToken } = useAuth();
  const [chats, setChats] = useState<UserChat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, [userId]);

  const loadChats = async () => {
    if (!accessToken || !userId) return;

    try {
      setLoading(true);
      // Используем новый API endpoint для получения чатов пользователя
      const chats = await usersApi.getUserChats(accessToken, userId);
      setChats(chats);
    } catch (error) {
      console.error('Failed to load user chats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        У пользователя нет чатов с поддержкой
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Чаты с поддержкой</h2>
      
      <div className="space-y-4">
        {chats.map((chat) => (
          <div key={chat.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Чат #{chat.id.slice(0, 8)}</span>
                    <Badge variant={chat.isActive ? 'default' : 'secondary'}>
                      {chat.isActive ? 'Активный' : 'Закрыт'}
                    </Badge>
                  </div>
                  {chat.manager && (
                    <p className="text-sm text-gray-600">
                      Менеджер: {chat.manager.firstName} {chat.manager.lastName}
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={`/panel/chats?chat=${chat.id}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Открыть чат
              </Link>
            </div>

            {chat.lastMessage && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {chat.lastMessage.content}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(chat.lastMessage.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                </p>
              </div>
            )}

            <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
              <span>Сообщений: {chat.messagesCount}</span>
              <span>
                Создан: {format(new Date(chat.createdAt), 'dd.MM.yyyy', { locale: ru })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}