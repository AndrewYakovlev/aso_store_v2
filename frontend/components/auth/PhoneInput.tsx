'use client';

import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
}

export function PhoneInput({ value = '', onChange, error, className, ...props }: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Limit to 11 digits (7 + 10 digits)
    const trimmed = digits.slice(0, 11);
    
    // Format the number
    let formatted = '+7';
    
    if (trimmed.length > 1) {
      formatted += ' (' + trimmed.slice(1, 4);
    }
    if (trimmed.length > 4) {
      formatted += ') ' + trimmed.slice(4, 7);
    }
    if (trimmed.length > 7) {
      formatted += '-' + trimmed.slice(7, 9);
    }
    if (trimmed.length > 9) {
      formatted += '-' + trimmed.slice(9, 11);
    }
    
    // Add closing parenthesis if we have area code
    if (trimmed.length === 4) {
      formatted += ')';
    }
    
    return formatted;
  };

  const getDigitPosition = (formattedPosition: number, formatted: string): number => {
    let digitCount = 0;
    for (let i = 0; i < formattedPosition && i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        digitCount++;
      }
    }
    return digitCount;
  };

  const getFormattedPosition = (digitPosition: number, formatted: string): number => {
    let digitCount = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        digitCount++;
        if (digitCount === digitPosition) {
          return i + 1;
        }
      }
    }
    return formatted.length;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const currentCursorPosition = e.target.selectionStart || 0;
    
    // If user tries to delete +7, prevent it
    if (input.length < 2) {
      onChange?.('+7');
      return;
    }
    
    // Get current digit position
    const digitPosition = getDigitPosition(currentCursorPosition, input);
    
    // Format the new value
    const formatted = formatPhoneNumber(input);
    
    // Calculate new cursor position
    const newCursorPosition = getFormattedPosition(digitPosition, formatted);
    setCursorPosition(newCursorPosition);
    
    onChange?.(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const cursorPos = target.selectionStart || 0;
    
    // Prevent deleting the +7 prefix
    if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPos <= 2) {
      e.preventDefault();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Place cursor after +7 if field is empty
    if (value === '+7' || value === '') {
      setTimeout(() => {
        e.target.setSelectionRange(2, 2);
      }, 0);
    }
  };

  React.useEffect(() => {
    if (inputRef.current && cursorPosition !== undefined) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [value, cursorPosition]);

  return (
    <Input
      ref={inputRef}
      type="tel"
      value={value || '+7'}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      className={cn(
        'font-mono',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      placeholder="+7 (___) ___-__-__"
      {...props}
    />
  );
}