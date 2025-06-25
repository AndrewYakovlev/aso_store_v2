'use client';

import { useState, useEffect } from 'react';
import { AnonymousUser } from '@/lib/api/anonymous-users';
import { usersApi } from '@/lib/api/users';
import { useAuth } from '@/lib/contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Loader2, UserCircle } from 'lucide-react';

interface UserAnonymousTabProps {
  userId: string;
}

export function UserAnonymousTab({ userId }: UserAnonymousTabProps) {
  const { accessToken } = useAuth();
  const [anonymousUsers, setAnonymousUsers] = useState<AnonymousUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnonymousUsers();
  }, [userId]);

  const loadAnonymousUsers = async () => {
    if (!accessToken || !userId) return;

    try {
      setLoading(true);
      // Используем новый API endpoint для получения анонимных пользователей
      const anonymousUsers = await usersApi.getUserAnonymousUsers(accessToken, userId);
      setAnonymousUsers(anonymousUsers);
    } catch (error) {
      console.error('Failed to load linked anonymous users:', error);
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

  if (anonymousUsers.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Нет связанных анонимных сессий
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Связанные анонимные сессии
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Эти анонимные сессии были объединены с учетной записью пользователя при регистрации
      </p>
      
      <div className="space-y-4">
        {anonymousUsers.map((anonUser) => (
          <div key={anonUser.id} className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <UserCircle className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-mono text-sm">
                  Токен: {anonUser.token.slice(0, 8)}...{anonUser.token.slice(-8)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Создан</p>
                <p className="font-medium">
                  {format(new Date(anonUser.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Последняя активность</p>
                <p className="font-medium">
                  {format(new Date(anonUser.lastActivity), 'dd.MM.yyyy HH:mm', { locale: ru })}
                </p>
              </div>
              {anonUser._count && (
                <>
                  <div>
                    <p className="text-gray-600">Корзина</p>
                    <p className="font-medium">{anonUser._count.carts || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Избранное</p>
                    <p className="font-medium">{anonUser._count.favorites || 0}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}