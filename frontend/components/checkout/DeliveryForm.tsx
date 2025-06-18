'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DeliveryMethod } from '@/lib/api/orders';

interface DeliveryFormProps {
  methods: DeliveryMethod[];
  selectedMethodId: string;
  onMethodChange: (methodId: string) => void;
  addressData: {
    deliveryAddress: string;
    deliveryCity: string;
    deliveryStreet: string;
    deliveryBuilding: string;
    deliveryApartment: string;
    deliveryPostalCode: string;
  };
  onAddressChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

export function DeliveryForm({
  methods,
  selectedMethodId,
  onMethodChange,
  addressData,
  onAddressChange,
  errors,
}: DeliveryFormProps) {
  const selectedMethod = methods.find(m => m.id === selectedMethodId);
  const needsAddress = selectedMethod?.code !== 'pickup';

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Способ доставки</h2>
      
      <RadioGroup value={selectedMethodId} onValueChange={onMethodChange}>
        {methods.map((method) => (
          <div key={method.id} className="flex items-start space-x-3 p-4 border rounded-lg">
            <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
            <Label htmlFor={method.id} className="flex-1 cursor-pointer">
              <div className="font-medium">{method.name}</div>
              {method.description && (
                <div className="text-sm text-gray-600 mt-1">{method.description}</div>
              )}
              <div className="text-sm font-medium mt-2">
                {method.price > 0 ? `${method.price} ₽` : 'Бесплатно'}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {needsAddress && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Адрес доставки</h3>
          
          <div>
            <Label htmlFor="deliveryAddress">Полный адрес</Label>
            <Textarea
              id="deliveryAddress"
              value={addressData.deliveryAddress}
              onChange={(e) => onAddressChange('deliveryAddress', e.target.value)}
              placeholder="Город, улица, дом, квартира"
              rows={2}
              className={errors?.deliveryAddress ? 'border-red-500' : ''}
            />
            {errors?.deliveryAddress && (
              <p className="text-sm text-red-500 mt-1">{errors.deliveryAddress}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deliveryCity">Город</Label>
              <Input
                id="deliveryCity"
                value={addressData.deliveryCity}
                onChange={(e) => onAddressChange('deliveryCity', e.target.value)}
                placeholder="Москва"
                className={errors?.deliveryCity ? 'border-red-500' : ''}
              />
              {errors?.deliveryCity && (
                <p className="text-sm text-red-500 mt-1">{errors.deliveryCity}</p>
              )}
            </div>

            <div>
              <Label htmlFor="deliveryPostalCode">Индекс</Label>
              <Input
                id="deliveryPostalCode"
                value={addressData.deliveryPostalCode}
                onChange={(e) => onAddressChange('deliveryPostalCode', e.target.value)}
                placeholder="123456"
                className={errors?.deliveryPostalCode ? 'border-red-500' : ''}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="deliveryStreet">Улица</Label>
            <Input
              id="deliveryStreet"
              value={addressData.deliveryStreet}
              onChange={(e) => onAddressChange('deliveryStreet', e.target.value)}
              placeholder="ул. Ленина"
              className={errors?.deliveryStreet ? 'border-red-500' : ''}
            />
            {errors?.deliveryStreet && (
              <p className="text-sm text-red-500 mt-1">{errors.deliveryStreet}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deliveryBuilding">Дом</Label>
              <Input
                id="deliveryBuilding"
                value={addressData.deliveryBuilding}
                onChange={(e) => onAddressChange('deliveryBuilding', e.target.value)}
                placeholder="1"
                className={errors?.deliveryBuilding ? 'border-red-500' : ''}
              />
              {errors?.deliveryBuilding && (
                <p className="text-sm text-red-500 mt-1">{errors.deliveryBuilding}</p>
              )}
            </div>

            <div>
              <Label htmlFor="deliveryApartment">Квартира/офис</Label>
              <Input
                id="deliveryApartment"
                value={addressData.deliveryApartment}
                onChange={(e) => onAddressChange('deliveryApartment', e.target.value)}
                placeholder="101"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}