'use client';

import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface PromoCode {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  validUntil: string | null;
  description?: string;
  createdAt: string;
}

interface NewPromoCodeBannerProps {
  promoCodes: PromoCode[];
}

export function NewPromoCodeBanner({ promoCodes }: NewPromoCodeBannerProps) {
  const [visibleCodes, setVisibleCodes] = useState<PromoCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // Show only promo codes created in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newCodes = promoCodes.filter(
      (code) => new Date(code.createdAt) > sevenDaysAgo
    );

    // Get dismissed codes from localStorage
    const dismissedCodes = JSON.parse(
      localStorage.getItem('dismissedPromoCodes') || '[]'
    );

    // Filter out dismissed codes
    const visibleNewCodes = newCodes.filter(
      (code) => !dismissedCodes.includes(code.id)
    );

    setVisibleCodes(visibleNewCodes);
  }, [promoCodes]);

  const handleDismiss = (codeId: string) => {
    // Add to dismissed codes in localStorage
    const dismissedCodes = JSON.parse(
      localStorage.getItem('dismissedPromoCodes') || '[]'
    );
    dismissedCodes.push(codeId);
    localStorage.setItem('dismissedPromoCodes', JSON.stringify(dismissedCodes));

    // Remove from visible codes
    setVisibleCodes((prev) => prev.filter((code) => code.id !== codeId));
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (visibleCodes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleCodes.map((promoCode) => {
        const discountText =
          promoCode.discountType === 'PERCENTAGE'
            ? `${promoCode.discountValue}%`
            : `${promoCode.discountValue} ₽`;

        const timeAgo = formatDistanceToNow(new Date(promoCode.createdAt), {
          addSuffix: true,
          locale: ru,
        });

        return (
          <div
            key={promoCode.id}
            className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 relative"
          >
            <button
              onClick={() => handleDismiss(promoCode.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pr-8">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    🎁 Новый промокод!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {promoCode.description || 'Специальное предложение для вас'}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Получен {timeAgo}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-md border border-green-300 dark:border-green-700">
                  <span className="font-mono font-semibold text-green-900 dark:text-green-100">
                    {promoCode.code}
                  </span>
                  <span className="ml-2 text-sm text-green-700 dark:text-green-300">
                    -{discountText}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(promoCode.code)}
                  className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/20"
                >
                  {copiedCode === promoCode.code ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Копировать
                    </>
                  )}
                </Button>
              </div>

              {promoCode.validUntil && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Действует до{' '}
                  {new Date(promoCode.validUntil).toLocaleDateString('ru-RU')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}