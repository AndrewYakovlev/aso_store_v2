'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromoCode } from '@/lib/api/promo-codes';

const formSchema = z.object({
  code: z.string().optional(),
  description: z.string().optional(),
  discountType: z.enum(['FIXED_AMOUNT', 'PERCENTAGE']),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().min(0).optional().nullable(),
  maxUsesTotal: z.number().min(1).optional().nullable(),
  maxUsesPerUser: z.number().min(1),
  firstOrderOnly: z.boolean(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  isPublic: z.boolean(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface PromoCodeFormProps {
  promoCode?: PromoCode | null;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export function PromoCodeForm({ promoCode, onSubmit, onCancel }: PromoCodeFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: promoCode?.code || '',
      description: promoCode?.description || '',
      discountType: promoCode?.discountType || 'FIXED_AMOUNT',
      discountValue: promoCode?.discountValue || 0,
      minOrderAmount: promoCode?.minOrderAmount || null,
      maxUsesTotal: promoCode?.maxUsesTotal || null,
      maxUsesPerUser: promoCode?.maxUsesPerUser || 1,
      firstOrderOnly: promoCode?.firstOrderOnly || false,
      validFrom: promoCode?.validFrom ? new Date(promoCode.validFrom).toISOString().slice(0, 16) : '',
      validUntil: promoCode?.validUntil ? new Date(promoCode.validUntil).toISOString().slice(0, 16) : '',
      isPublic: promoCode?.isPublic ?? true,
      isActive: promoCode?.isActive ?? true,
    },
  });

  async function handleSubmit(data: FormData) {
    try {
      setLoading(true);
      const submitData = {
        ...data,
        minOrderAmount: data.minOrderAmount || undefined,
        maxUsesTotal: data.maxUsesTotal || undefined,
        validFrom: data.validFrom || undefined,
        validUntil: data.validUntil || undefined,
      };
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="code">Код промокода</Label>
        <Input
          id="code"
          {...form.register('code')}
          placeholder="Оставьте пустым для автогенерации"
          disabled={!!promoCode}
        />
        {form.formState.errors.code && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.code.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Внутреннее описание промокода"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discountType">Тип скидки</Label>
          <Select
            value={form.watch('discountType')}
            onValueChange={(value) => form.setValue('discountType', value as 'FIXED_AMOUNT' | 'PERCENTAGE')}
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
          <Label htmlFor="discountValue">
            {form.watch('discountType') === 'PERCENTAGE' ? 'Процент скидки' : 'Сумма скидки'}
          </Label>
          <Input
            id="discountValue"
            type="number"
            step={form.watch('discountType') === 'PERCENTAGE' ? 1 : 0.01}
            {...form.register('discountValue', { valueAsNumber: true })}
          />
          {form.formState.errors.discountValue && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.discountValue.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="minOrderAmount">Минимальная сумма заказа</Label>
        <Input
          id="minOrderAmount"
          type="number"
          step="0.01"
          {...form.register('minOrderAmount', { valueAsNumber: true })}
          placeholder="Оставьте пустым если не требуется"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxUsesTotal">Макс. использований всего</Label>
          <Input
            id="maxUsesTotal"
            type="number"
            {...form.register('maxUsesTotal', { valueAsNumber: true })}
            placeholder="Без ограничений"
          />
        </div>

        <div>
          <Label htmlFor="maxUsesPerUser">Макс. использований на пользователя</Label>
          <Input
            id="maxUsesPerUser"
            type="number"
            {...form.register('maxUsesPerUser', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="validFrom">Действует с</Label>
          <Input
            id="validFrom"
            type="datetime-local"
            {...form.register('validFrom')}
          />
        </div>

        <div>
          <Label htmlFor="validUntil">Действует до</Label>
          <Input
            id="validUntil"
            type="datetime-local"
            {...form.register('validUntil')}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="firstOrderOnly">Только для первого заказа</Label>
          <Switch
            id="firstOrderOnly"
            checked={form.watch('firstOrderOnly')}
            onCheckedChange={(checked) => form.setValue('firstOrderOnly', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isPublic">Публичный промокод</Label>
          <Switch
            id="isPublic"
            checked={form.watch('isPublic')}
            onCheckedChange={(checked) => form.setValue('isPublic', checked)}
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
          {loading ? 'Сохранение...' : promoCode ? 'Сохранить' : 'Создать'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}