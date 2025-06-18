'use client';

import { useState } from 'react';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { authApi } from '@/lib/api/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { ClientAnonymousTokenService } from '@/lib/services/client-token.service';

interface AuthStepProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  onAuthSuccess: (data: any) => void;
}

export function AuthStep({ phone, onPhoneChange, onAuthSuccess }: AuthStepProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await authApi.sendOtp(phone);
      
      // In dev mode, show the OTP code
      if (process.env.NODE_ENV === 'development' && response.code) {
        setDevOtpCode(response.code);
      }
      
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при отправке кода');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Get anonymous token to merge data
      const anonymousToken = ClientAnonymousTokenService.getToken();
      const response = await authApi.verifyOtp(phone, otp, anonymousToken || undefined);
      onAuthSuccess(response);
    } catch (err: any) {
      setError(err.message || 'Неверный код подтверждения');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp('');
    setDevOtpCode(null);
    setStep('phone');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Подтверждение телефона</h2>
      
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Для оформления заказа необходимо подтвердить номер телефона. 
          Это займет всего минуту и позволит вам отслеживать статус заказа.
        </AlertDescription>
      </Alert>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Номер телефона
            </label>
            <PhoneInput
              value={phone}
              onChange={onPhoneChange}
              placeholder="+7 (999) 999-99-99"
              disabled={loading}
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          
          <Button
            onClick={handleSendOtp}
            disabled={loading || !phone}
            className="w-full"
          >
            {loading ? 'Отправка...' : 'Получить код подтверждения'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Код из SMS
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Отправлен на номер {phone}
            </p>
            
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
              disabled={loading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            
            {devOtpCode && (
              <p className="text-sm text-blue-600 mt-2">
                Dev mode: код {devOtpCode}
              </p>
            )}
          </div>
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResendOtp}
              disabled={loading}
              className="flex-1"
            >
              Изменить номер
            </Button>
            
            <Button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="flex-1"
            >
              {loading ? 'Проверка...' : 'Подтвердить'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}