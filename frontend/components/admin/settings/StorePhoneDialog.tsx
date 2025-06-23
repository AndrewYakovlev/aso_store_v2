'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  createStorePhone,
  updateStorePhone,
  type StorePhone,
  type CreateStorePhoneData,
} from '@/lib/api/settings';

const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+7\d{10}$/, 'Телефон должен быть в формате +7XXXXXXXXXX'),
  name: z.string().optional(),
  isWhatsApp: z.boolean(),
  isTelegram: z.boolean(),
  isMain: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number().min(0),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

interface StorePhoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: StorePhone | null;
  onSuccess: () => void;
}

export function StorePhoneDialog({
  open,
  onOpenChange,
  phone,
  onSuccess,
}: StorePhoneDialogProps) {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: phone?.phone || '+7',
      name: phone?.name || '',
      isWhatsApp: phone?.isWhatsApp || false,
      isTelegram: phone?.isTelegram || false,
      isMain: phone?.isMain || false,
      isActive: phone?.isActive ?? true,
      sortOrder: phone?.sortOrder || 0,
    },
  });

  // Update form when phone prop changes
  useEffect(() => {
    if (phone) {
      form.reset({
        phone: phone.phone,
        name: phone.name || '',
        isWhatsApp: phone.isWhatsApp,
        isTelegram: phone.isTelegram,
        isMain: phone.isMain,
        isActive: phone.isActive,
        sortOrder: phone.sortOrder,
      });
    } else {
      form.reset({
        phone: '+7',
        name: '',
        isWhatsApp: false,
        isTelegram: false,
        isMain: false,
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [phone, form]);

  const onSubmit = async (data: PhoneFormData) => {
    if (!accessToken) return;

    setLoading(true);
    try {
      if (phone) {
        await updateStorePhone(phone.id, data, accessToken!);
      } else {
        await createStorePhone(data as CreateStorePhoneData, accessToken!);
      }
      onSuccess();
      form.reset();
    } catch (error) {
      console.error('Failed to save phone:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {phone ? 'Редактировать телефон' : 'Добавить телефон'}
          </DialogTitle>
          <DialogDescription>
            {phone
              ? 'Измените информацию о телефоне магазина'
              : 'Добавьте новый телефон магазина'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Номер телефона</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+79991234567"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Введите номер в формате +7XXXXXXXXXX
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название (необязательно)</FormLabel>
                  <FormControl>
                    <Input placeholder="Отдел продаж" {...field} />
                  </FormControl>
                  <FormDescription>
                    Например: Отдел продаж, Техподдержка, Горячая линия
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="isWhatsApp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Доступен в WhatsApp</FormLabel>
                      <FormDescription>
                        Клиенты смогут написать в WhatsApp по этому номеру
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isTelegram"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Доступен в Telegram</FormLabel>
                      <FormDescription>
                        Клиенты смогут написать в Telegram по этому номеру
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isMain"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Основной номер</FormLabel>
                      <FormDescription>
                        Будет отображаться первым в списке контактов
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Активен</FormLabel>
                      <FormDescription>
                        Неактивные номера не будут показываться клиентам
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Порядок сортировки</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Меньшие значения отображаются первыми
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}