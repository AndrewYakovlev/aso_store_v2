'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';

interface ContactFormProps {
  data: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  };
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

export function ContactForm({ data, onChange, errors }: ContactFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Контактная информация</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="customerName">Имя *</Label>
          <Input
            id="customerName"
            value={data.customerName}
            onChange={(e) => onChange('customerName', e.target.value)}
            placeholder="Иван Иванов"
            className={errors?.customerName ? 'border-red-500' : ''}
          />
          {errors?.customerName && (
            <p className="text-sm text-red-500 mt-1">{errors.customerName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="customerPhone">Телефон *</Label>
          <PhoneInput
            id="customerPhone"
            value={data.customerPhone}
            onChange={(value) => onChange('customerPhone', value)}
            placeholder="+7 (999) 999-99-99"
            className={errors?.customerPhone ? 'border-red-500' : ''}
          />
          {errors?.customerPhone && (
            <p className="text-sm text-red-500 mt-1">{errors.customerPhone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="customerEmail">Email</Label>
          <Input
            id="customerEmail"
            type="email"
            value={data.customerEmail}
            onChange={(e) => onChange('customerEmail', e.target.value)}
            placeholder="ivan@example.com"
            className={errors?.customerEmail ? 'border-red-500' : ''}
          />
          {errors?.customerEmail && (
            <p className="text-sm text-red-500 mt-1">{errors.customerEmail}</p>
          )}
        </div>
      </div>
    </div>
  );
}