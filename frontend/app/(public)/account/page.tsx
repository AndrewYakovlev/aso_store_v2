'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api/auth';
import { NotificationPermissionButton } from '@/components/NotificationPermission';
import { Bell, TicketIcon } from 'lucide-react';
import { NewPromoCodeBanner } from '@/components/promo-codes/NewPromoCodeBanner';
import { promoCodesClientApi } from '@/lib/api/promo-codes-client';

export default function AccountPage() {
  const { user, loading, logout, accessToken } = useAuth();
  const router = useRouter();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userPromoCodes, setUserPromoCodes] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (accessToken) {
        try {
          const [profile, promoCodes] = await Promise.all([
            authApi.getProfile(accessToken),
            promoCodesClientApi.getUserPromoCodes(),
          ]);
          setUserProfile(profile);
          setUserPromoCodes(promoCodes);
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    if (user && accessToken) {
      fetchData();
    }
  }, [user, accessToken]);

  const handleUpdateProfile = async (data: any) => {
    if (!accessToken) return;
    
    const updatedProfile = await authApi.updateProfile(accessToken, data);
    setUserProfile(updatedProfile);
    setIsEditingProfile(false);
  };

  if (loading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  if (isEditingProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setIsEditingProfile(false)}
          >
            ← Назад к профилю
          </Button>
        </div>
        <ProfileForm 
          user={userProfile} 
          onUpdate={handleUpdateProfile} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>

      <NewPromoCodeBanner promoCodes={userPromoCodes} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Профиль</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Телефон</p>
              <p className="font-medium">{userProfile.phone}</p>
            </div>
            {userProfile.firstName && (
              <div>
                <p className="text-sm text-muted-foreground">Имя</p>
                <p className="font-medium">{userProfile.firstName}</p>
              </div>
            )}
            {userProfile.lastName && (
              <div>
                <p className="text-sm text-muted-foreground">Фамилия</p>
                <p className="font-medium">{userProfile.lastName}</p>
              </div>
            )}
            {userProfile.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>
            )}
            {userProfile.companyName && (
              <div>
                <p className="text-sm text-muted-foreground">Компания</p>
                <p className="font-medium">{userProfile.companyName}</p>
              </div>
            )}
            <div className="pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditingProfile(true)}
              >
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
            <p className="text-muted-foreground">История ваших заказов</p>
            <div className="pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/orders')}
              >
                Смотреть заказы
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Избранное</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Ваши избранные товары</p>
            <div className="pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/favorites')}
              >
                Смотреть избранное
              </Button>
            </div>
          </CardContent>
        </Card>

        {userProfile.defaultShippingAddress && (
          <Card>
            <CardHeader>
              <CardTitle>Адрес доставки</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{userProfile.defaultShippingAddress}</p>
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Изменить адрес
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              Промокоды
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Ваши скидки и промокоды</p>
            <div className="pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/account/promo-codes')}
              >
                Смотреть промокоды
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Уведомления
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Получайте уведомления о новых сообщениях и предложениях
            </p>
            <NotificationPermissionButton />
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