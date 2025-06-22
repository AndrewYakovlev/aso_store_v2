const webpush = require('web-push');

// Генерируем VAPID ключи
const vapidKeys = webpush.generateVAPIDKeys();

console.log('Добавьте эти ключи в ваш .env файл:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@aso-store.ru`);
console.log('\nТакже добавьте публичный ключ в frontend .env файл:');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);