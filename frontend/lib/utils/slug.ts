/**
 * Генерирует URL-slug из русского или английского текста
 * Поддерживает транслитерацию кириллицы
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[а-яё]/g, (match) => {
      const ru = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
      const en = [
        'a', 'b', 'v', 'g', 'd', 'e', 'yo', 'zh', 'z', 'i', 'y', 'k', 'l', 'm',
        'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'ts', 'ch', 'sh', 'sch',
        '', 'y', '', 'e', 'yu', 'ya'
      ];
      return en[ru.indexOf(match)] || match;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Проверяет, является ли строка валидным slug
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Очищает slug от недопустимых символов
 */
export function cleanSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}