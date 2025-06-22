'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { TicketIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PromoCode } from '@/lib/api/promo-codes';
import { promoCodesClientApi } from '@/lib/api/promo-codes-client';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

export default function MyPromoCodesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    loadPromoCodes();
  }, [user, router]);

  async function loadPromoCodes() {
    try {
      setLoading(true);
      const response = await promoCodesClientApi.getUserPromoCodes();
      setPromoCodes(response);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить промокоды',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Скопировано',
      description: `Промокод ${code} скопирован в буфер обмена`,
    });
  };

  const isExpired = (validUntil?: string) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const isUsed = (promoCode: PromoCode) => {
    return promoCode.currentUses && promoCode.currentUses >= promoCode.maxUsesPerUser;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Мои промокоды</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка промокодов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Мои промокоды</h1>
        <p className="text-muted-foreground">
          Здесь вы можете просмотреть все ваши персональные промокоды и доступные публичные промокоды
        </p>
      </div>

      {promoCodes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TicketIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">У вас пока нет доступных промокодов</p>
            <p className="text-sm text-muted-foreground mt-2">
              Промокоды будут появляться здесь автоматически при различных событиях
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {promoCodes.map((promoCode) => {
            const expired = isExpired(promoCode.validUntil);
            const used = isUsed(promoCode);
            const disabled = expired || used || !promoCode.isActive;

            return (
              <Card key={promoCode.id} className={disabled ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TicketIcon className="w-5 h-5" />
                        {promoCode.code}
                      </CardTitle>
                      {promoCode.description && (
                        <CardDescription className="mt-1">
                          {promoCode.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {!promoCode.isPublic && (
                        <Badge variant="secondary" className="text-xs">
                          Персональный
                        </Badge>
                      )}
                      {used && (
                        <Badge variant="destructive" className="text-xs">
                          Использован
                        </Badge>
                      )}
                      {expired && (
                        <Badge variant="destructive" className="text-xs">
                          Истек
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Скидка:</span>
                    <span className="font-medium">
                      {promoCode.discountType === 'PERCENTAGE'
                        ? `${promoCode.discountValue}%`
                        : formatPrice(promoCode.discountValue)}
                    </span>
                  </div>

                  {promoCode.minOrderAmount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Мин. заказ:</span>
                      <span className="font-medium">{formatPrice(promoCode.minOrderAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Использований:</span>
                    <span className="font-medium">
                      {promoCode.currentUses || 0} из {promoCode.maxUsesPerUser}
                    </span>
                  </div>

                  {promoCode.validUntil && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        Действует до {new Date(promoCode.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {promoCode.firstOrderOnly && (
                    <Badge variant="outline" className="text-xs">
                      Только для первого заказа
                    </Badge>
                  )}

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => copyToClipboard(promoCode.code)}
                      disabled={disabled}
                    >
                      {disabled ? 'Недоступен' : 'Скопировать код'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}