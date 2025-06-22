'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromoCodeTrigger } from '@/lib/api/promo-codes';

const formSchema = z.object({
  triggerType: z.string(),
  isActive: z.boolean(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  settings: z.object({
    discountType: z.enum(['FIXED_AMOUNT', 'PERCENTAGE']),
    discountValue: z.number().positive(),
    minOrderAmount: z.number().min(0).optional().nullable(),
    maxUsesPerUser: z.number().min(1),
    firstOrderOnly: z.boolean(),
    validityDays: z.number().min(1),
  }),
});

type FormData = z.infer<typeof formSchema>;

interface TriggerFormProps {
  trigger?: PromoCodeTrigger | null;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export function TriggerForm({ trigger, onSubmit, onCancel }: TriggerFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      triggerType: trigger?.triggerType || 'REGISTRATION',
      isActive: trigger?.isActive ?? true,
      validFrom: trigger?.validFrom ? new Date(trigger.validFrom).toISOString().slice(0, 16) : '',
      validUntil: trigger?.validUntil ? new Date(trigger.validUntil).toISOString().slice(0, 16) : '',
      settings: {
        discountType: trigger?.settings.discountType || 'FIXED_AMOUNT',
        discountValue: trigger?.settings.discountValue || 0,
        minOrderAmount: trigger?.settings.minOrderAmount || null,
        maxUsesPerUser: trigger?.settings.maxUsesPerUser || 1,
        firstOrderOnly: trigger?.settings.firstOrderOnly || false,
        validityDays: trigger?.settings.validityDays || 30,
      },
    },
  });

  async function handleSubmit(data: FormData) {
    try {
      setLoading(true);
      const submitData = {
        ...data,
        validFrom: data.validFrom || undefined,
        validUntil: data.validUntil || undefined,
        settings: {
          ...data.settings,
          minOrderAmount: data.settings.minOrderAmount || undefined,
        },
      };
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="triggerType">Тип триггера</Label>
        <Select
          value={form.watch('triggerType')}
          onValueChange={(value) => form.setValue('triggerType', value)}
          disabled={!!trigger}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="REGISTRATION">Регистрация</SelectItem>
            <SelectItem value="FIRST_ORDER" disabled>Первый заказ (скоро)</SelectItem>
            <SelectItem value="BIRTHDAY" disabled>День рождения (скоро)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="settings.discountType">Тип скидки</Label>
          <Select
            value={form.watch('settings.discountType')}
            onValueChange={(value) => form.setValue('settings.discountType', value as 'FIXED_AMOUNT' | 'PERCENTAGE')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FIXED_AMOUNT">Фиксированная сумма</SelectItem>
              <SelectItem value="PERCENTAGE">Процент</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="settings.discountValue">
            {form.watch('settings.discountType') === 'PERCENTAGE' ? 'Процент скидки' : 'Сумма скидки'}
          </Label>
          <Input
            id="settings.discountValue"
            type="number"
            step={form.watch('settings.discountType') === 'PERCENTAGE' ? 1 : 0.01}
            {...form.register('settings.discountValue', { valueAsNumber: true })}
          />
          {form.formState.errors.settings?.discountValue && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.settings.discountValue.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="settings.minOrderAmount">Минимальная сумма заказа</Label>
        <Input
          id="settings.minOrderAmount"
          type="number"
          step="0.01"
          {...form.register('settings.minOrderAmount', { valueAsNumber: true })}
          placeholder="Оставьте пустым если не требуется"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="settings.maxUsesPerUser">Макс. использований на пользователя</Label>
          <Input
            id="settings.maxUsesPerUser"
            type="number"
            {...form.register('settings.maxUsesPerUser', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="settings.validityDays">Срок действия (дней)</Label>
          <Input
            id="settings.validityDays"
            type="number"
            {...form.register('settings.validityDays', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="validFrom">Триггер активен с</Label>
          <Input
            id="validFrom"
            type="datetime-local"
            {...form.register('validFrom')}
          />
        </div>

        <div>
          <Label htmlFor="validUntil">Триггер активен до</Label>
          <Input
            id="validUntil"
            type="datetime-local"
            {...form.register('validUntil')}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="settings.firstOrderOnly">Только для первого заказа</Label>
          <Switch
            id="settings.firstOrderOnly"
            checked={form.watch('settings.firstOrderOnly')}
            onCheckedChange={(checked) => form.setValue('settings.firstOrderOnly', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isActive">Активен</Label>
          <Switch
            id="isActive"
            checked={form.watch('isActive')}
            onCheckedChange={(checked) => form.setValue('isActive', checked)}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Сохранение...' : trigger ? 'Сохранить' : 'Создать'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}