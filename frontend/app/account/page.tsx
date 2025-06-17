'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Профиль</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Телефон</p>
              <p className="font-medium">{user.phone}</p>
            </div>
            {user.firstName && (
              <div>
                <p className="text-sm text-muted-foreground">Имя</p>
                <p className="font-medium">{user.firstName}</p>
              </div>
            )}
            {user.lastName && (
              <div>
                <p className="text-sm text-muted-foreground">Фамилия</p>
                <p className="font-medium">{user.lastName}</p>
              </div>
            )}
            <div className="pt-4">
              <Button variant="outline" size="sm">
                Редактировать
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Мои заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">У вас пока нет заказов</p>
            <div className="pt-4">
              <Button variant="outline" size="sm">
                Перейти в каталог
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Избранное</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">В избранном пока пусто</p>
            <div className="pt-4">
              <Button variant="outline" size="sm">
                Перейти в каталог
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button onClick={logout} variant="outline">
          Выйти
        </Button>
      </div>
    </div>
  );
}