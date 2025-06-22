'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { TriggerForm } from './TriggerForm';
import { promoCodesApi, PromoCodeTrigger } from '@/lib/api/promo-codes';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/contexts/AuthContext';

export function PromoCodeTriggers() {
  const { accessToken } = useAuth();
  const [triggers, setTriggers] = useState<PromoCodeTrigger[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<PromoCodeTrigger | null>(null);

  useEffect(() => {
    loadTriggers();
  }, [accessToken]);

  async function loadTriggers() {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const data = await promoCodesApi.getTriggers(accessToken);
      setTriggers(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить триггеры',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(trigger: PromoCodeTrigger) {
    if (!accessToken) return;
    
    try {
      await promoCodesApi.updateTrigger(accessToken, trigger.id, {
        isActive: !trigger.isActive,
      });
      toast({
        title: 'Успешно',
        description: trigger.isActive ? 'Триггер деактивирован' : 'Триггер активирован',
      });
      loadTriggers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить триггер',
        variant: 'destructive',
      });
    }
  }

  async function handleCreateOrUpdate(data: any) {
    if (!accessToken) return;
    
    try {
      if (editingTrigger) {
        await promoCodesApi.updateTrigger(accessToken, editingTrigger.id, data);
        toast({
          title: 'Успешно',
          description: 'Триггер обновлен',
        });
      } else {
        await promoCodesApi.createTrigger(accessToken, data);
        toast({
          title: 'Успешно',
          description: 'Триггер создан',
        });
      }
      setIsCreateOpen(false);
      setEditingTrigger(null);
      loadTriggers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить триггер',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Вы уверены, что хотите удалить этот триггер?')) {
      return;
    }

    if (!accessToken) return;

    try {
      await promoCodesApi.deleteTrigger(accessToken, id);
      toast({
        title: 'Успешно',
        description: 'Триггер удален',
      });
      loadTriggers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить триггер',
        variant: 'destructive',
      });
    }
  }

  const getTriggerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      REGISTRATION: 'Регистрация',
      FIRST_ORDER: 'Первый заказ',
      BIRTHDAY: 'День рождения',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать триггер
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : triggers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Триггеры не настроены</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {triggers.map((trigger) => (
            <Card key={trigger.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {getTriggerTypeLabel(trigger.triggerType)}
                    </CardTitle>
                    <CardDescription>
                      {trigger.validUntil
                        ? `Действует до ${new Date(trigger.validUntil).toLocaleDateString()}`
                        : 'Бессрочно'}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={trigger.isActive}
                    onCheckedChange={() => handleToggleActive(trigger)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Скидка:</span>
                    <p className="font-medium">
                      {trigger.settings.discountType === 'PERCENTAGE'
                        ? `${trigger.settings.discountValue}%`
                        : formatPrice(trigger.settings.discountValue)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Срок действия:</span>
                    <p className="font-medium">{trigger.settings.validityDays} дней</p>
                  </div>
                </div>

                {trigger.settings.minOrderAmount && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Мин. заказ:</span>
                    <p className="font-medium">{formatPrice(trigger.settings.minOrderAmount)}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {trigger.settings.firstOrderOnly && (
                    <Badge variant="secondary">Только первый заказ</Badge>
                  )}
                  <Badge variant="outline">
                    {trigger.settings.maxUsesPerUser} исп. на пользователя
                  </Badge>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingTrigger(trigger);
                      setIsCreateOpen(true);
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(trigger.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingTrigger(null);
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {editingTrigger ? 'Редактировать триггер' : 'Создать триггер'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <TriggerForm
              trigger={editingTrigger}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => {
                setIsCreateOpen(false);
                setEditingTrigger(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}