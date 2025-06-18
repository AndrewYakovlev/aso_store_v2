'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PaymentMethod } from '@/lib/api/orders';

interface PaymentFormProps {
  methods: PaymentMethod[];
  selectedMethodId: string;
  onMethodChange: (methodId: string) => void;
}

export function PaymentForm({
  methods,
  selectedMethodId,
  onMethodChange,
}: PaymentFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Способ оплаты</h2>
      
      <RadioGroup value={selectedMethodId} onValueChange={onMethodChange}>
        {methods.map((method) => (
          <div key={method.id} className="flex items-start space-x-3 p-4 border rounded-lg">
            <RadioGroupItem value={method.id} id={`payment-${method.id}`} className="mt-1" />
            <Label htmlFor={`payment-${method.id}`} className="flex-1 cursor-pointer">
              <div className="font-medium">{method.name}</div>
              {method.description && (
                <div className="text-sm text-gray-600 mt-1">{method.description}</div>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}