'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { PhoneInput } from './PhoneInput';
import { authApi } from '@/lib/api/auth';
import { useAnonymousToken } from '@/lib/hooks/useAnonymousToken';
import { ApiError } from '@/lib/api/client';
import { normalizePhone } from '@/lib/utils/phone';

// Phone validation schema
const phoneSchema = z.object({
  phone: z.string()
    .min(18, 'Введите полный номер телефона')
    .regex(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Неверный формат телефона'),
});

// OTP validation schema
const otpSchema = z.object({
  code: z.string().length(6, 'Код должен содержать 6 цифр'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

interface AuthFormProps {
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function AuthForm({ onSuccess, onCancel }: AuthFormProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  
  const { token: anonymousToken } = useAnonymousToken();

  // Phone form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
    },
  });

  // OTP form
  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: '',
    },
  });

  const handlePhoneSubmit = async (data: PhoneFormData) => {
    setLoading(true);
    setError(null);
    setDevCode(null);
    
    try {
      const response = await authApi.sendOtp(normalizePhone(data.phone));
      setPhone(data.phone);
      setStep('otp');
      
      // In development, show the code
      if (response.code) {
        setDevCode(response.code);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при отправке кода');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (data: OtpFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.verifyOtp(normalizePhone(phone), data.code, anonymousToken || undefined);
      
      // Save tokens
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      
      // Clear anonymous token as user is now authenticated
      localStorage.removeItem('anonymous_token');
      localStorage.removeItem('anonymous_user_id');
      
      onSuccess?.(response);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError('Превышено количество попыток. Запросите новый код.');
          setStep('phone');
          phoneForm.reset();
          otpForm.reset();
        } else {
          setError('Неверный код подтверждения');
        }
      } else {
        setError('Произошла ошибка при проверке кода');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setStep('phone');
    otpForm.reset();
    setDevCode(null);
    setError(null);
  };

  // Auto-focus OTP input when switching to OTP step
  useEffect(() => {
    if (step === 'otp') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // Try to find the actual input element
        const otpInput = document.querySelector('input[inputmode="numeric"]') as HTMLInputElement;
        if (otpInput) {
          otpInput.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Auto-submit when OTP is complete
  const otpCode = otpForm.watch('code');
  useEffect(() => {
    if (otpCode && otpCode.length === 6 && !loading) {
      otpForm.handleSubmit(handleOtpSubmit)();
    }
  }, [otpCode, loading, otpForm, handleOtpSubmit]);

  if (step === 'phone') {
    return (
      <Form {...phoneForm}>
        <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-6">
          <FormField
            control={phoneForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Номер телефона</FormLabel>
                <FormControl>
                  <PhoneInput
                    {...field}
                    error={!!phoneForm.formState.errors.phone}
                    disabled={loading}
                  />
                </FormControl>
                <FormDescription>
                  Мы отправим вам SMS с кодом подтверждения
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Отправка...' : 'Получить код'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Отмена
              </Button>
            )}
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...otpForm}>
      <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Код отправлен на номер
          </p>
          <p className="font-mono font-medium">{phone}</p>
        </div>

        <FormField
          control={otpForm.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Код подтверждения</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  disabled={loading}
                  autoFocus
                >
                  <InputOTPGroup className="w-full justify-center">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {devCode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
            <p className="text-yellow-800">
              <strong>Dev mode:</strong> Код подтверждения: <span className="font-mono">{devCode}</span>
            </p>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Проверка...' : 'Подтвердить'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleResendCode}
            disabled={loading}
          >
            Отправить снова
          </Button>
        </div>
      </form>
    </Form>
  );
}