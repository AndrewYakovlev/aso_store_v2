/**
 * Утилиты для работы с номерами телефонов
 */

/**
 * Нормализует номер телефона к формату +79999999999
 * Удаляет все символы кроме цифр и +
 * @param phone - номер телефона в любом формате
 * @returns нормализованный номер телефона
 */
export function normalizePhone(phone: string): string {
  if (!phone) return phone;

  // Удаляем все символы кроме цифр и +
  let normalized = phone.replace(/[^\d+]/g, '');

  // Если номер начинается с 8, заменяем на +7
  if (normalized.startsWith('8')) {
    normalized = '+7' + normalized.substring(1);
  }

  // Если номер начинается с 7 (без +), добавляем +
  if (normalized.startsWith('7') && !normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }

  // Если номер не начинается с +, предполагаем что это российский номер
  if (!normalized.startsWith('+')) {
    normalized = '+7' + normalized;
  }

  return normalized;
}

/**
 * Форматирует номер телефона для отображения: +7 (999) 999-99-99
 * @param phone - нормализованный номер телефона
 * @returns отформатированный номер телефона
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return phone;

  // Сначала нормализуем
  const normalized = normalizePhone(phone);

  // Проверяем, что это российский номер
  if (!normalized.startsWith('+7') || normalized.length !== 12) {
    return normalized;
  }

  // Форматируем: +7 (999) 999-99-99
  const match = normalized.match(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (!match) return normalized;

  return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
}

/**
 * Проверяет, что номер телефона валидный российский номер
 * @param phone - номер телефона
 * @returns true если номер валидный
 */
export function isValidRussianPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^\+7\d{10}$/.test(normalized);
}
