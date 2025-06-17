'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AuthForm } from './AuthForm';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: any) => void;
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const handleSuccess = (data: any) => {
    onSuccess?.(data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Вход в личный кабинет</DialogTitle>
          <DialogDescription>
            Введите номер телефона для входа или регистрации
          </DialogDescription>
        </DialogHeader>
        <AuthForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}