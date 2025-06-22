# Устранение неполадок Push-уведомлений

## Диагностика проблем

### 1. Проверка базовых компонентов

#### Service Worker
```javascript
// В консоли браузера
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Проверка активного Service Worker
navigator.serviceWorker.ready.then(registration => {
  console.log('Active SW:', registration.active);
});
```

#### Push подписка
```javascript
// Проверка текущей подписки
navigator.serviceWorker.ready.then(registration => {
  return registration.pushManager.getSubscription();
}).then(subscription => {
  console.log('Current subscription:', subscription);
});
```

#### Проверка разрешений
```javascript
// Текущий статус разрешений
Notification.permission // 'granted', 'denied', или 'default'
```

### 2. Тестирование отправки уведомлений

#### Тест через API
```bash
# Получите endpoint из подписки в браузере
# Затем отправьте тестовое уведомление
curl -X POST http://localhost:4000/api/notifications/test/ENDPOINT \
  -H "Content-Type: application/json"
```

#### Проверка в базе данных
```sql
-- Все подписки
SELECT id, "userId", "anonymousUserId", "isActive", "createdAt" 
FROM "PushSubscription" 
ORDER BY "createdAt" DESC;

-- Подписки конкретного пользователя
SELECT * FROM "PushSubscription" 
WHERE "userId" = 'USER_ID' OR "anonymousUserId" = 'ANON_ID';

-- Неактивные подписки (для очистки)
SELECT COUNT(*) FROM "PushSubscription" WHERE "isActive" = false;
```

### 3. Частые проблемы и решения

#### Проблема: "Registration failed - missing applicationServerKey"

**Причина**: Не указан или неправильный VAPID публичный ключ

**Решение**:
1. Проверьте переменную окружения:
   ```bash
   echo $NEXT_PUBLIC_VAPID_PUBLIC_KEY
   ```
2. Убедитесь, что ключ доступен в браузере:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
   ```

#### Проблема: "Notification permission denied"

**Причина**: Пользователь заблокировал уведомления

**Решение**:
1. Chrome: `chrome://settings/content/notifications`
2. Firefox: `about:preferences#privacy`
3. Сбросить разрешения для сайта и запросить заново

#### Проблема: "Failed to send notification: 400 Bad Request"

**Причина**: Неправильный формат данных или истекшая подписка

**Решение**:
```javascript
// Проверьте формат подписки
{
  endpoint: "https://fcm.googleapis.com/fcm/send/...",
  keys: {
    p256dh: "base64string...",
    auth: "base64string..."
  }
}
```

#### Проблема: "DOMException: Failed to execute 'showNotification'"

**Причина**: Неправильный формат данных уведомления

**Решение**:
```javascript
// Правильный формат
self.registration.showNotification('Заголовок', {
  body: 'Текст уведомления',
  icon: '/icon-192x192.png', // Путь должен быть абсолютным
  badge: '/badge-72x72.png',
  data: { /* данные */ }
});
```

### 4. Отладка на разных платформах

#### iOS (Safari)
- Требуется iOS 16.4+
- Сайт должен быть добавлен на главный экран как PWA
- Проверьте manifest.json

#### Android (Chrome)
```bash
# Отладка через Chrome DevTools
chrome://inspect/#devices
```

#### Desktop
- Chrome: `chrome://settings/content/notifications`
- Edge: `edge://settings/content/notifications`
- Firefox: `about:preferences#privacy`

### 5. Мониторинг и логирование

#### Backend логирование
```typescript
// В notifications.service.ts добавьте детальное логирование
this.logger.debug('Sending notification to:', subscription.endpoint);
this.logger.debug('Notification payload:', JSON.stringify(notification));
```

#### Frontend логирование
```javascript
// В sw.js
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received:', event);
  console.log('[Service Worker] Push data:', event.data?.json());
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification clicked:', event);
});
```

### 6. Очистка и обслуживание

#### Удаление недействительных подписок
```sql
-- Найти старые неактивные подписки
SELECT * FROM "PushSubscription" 
WHERE "isActive" = false 
AND "updatedAt" < NOW() - INTERVAL '30 days';

-- Удалить их
DELETE FROM "PushSubscription" 
WHERE "isActive" = false 
AND "updatedAt" < NOW() - INTERVAL '30 days';
```

#### Сброс Service Worker
```javascript
// Полная переустановка Service Worker
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});
```

### 7. Инструменты для тестирования

#### Chrome DevTools
1. Application → Service Workers
2. Application → Push Messaging
3. Network → проверка запросов к push сервису

#### Тестовый скрипт
```javascript
// test-push.js
const webpush = require('web-push');

// Настройте VAPID
webpush.setVapidDetails(
  'mailto:test@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Тестовая подписка (получите из браузера)
const subscription = {
  endpoint: '...',
  keys: {
    p256dh: '...',
    auth: '...'
  }
};

// Отправка
webpush.sendNotification(subscription, JSON.stringify({
  title: 'Тест',
  body: 'Тестовое уведомление'
}))
.then(result => console.log('Success:', result))
.catch(error => console.error('Error:', error));
```

### 8. Проверочный чек-лист

- [ ] HTTPS работает (или localhost для разработки)
- [ ] VAPID ключи правильно настроены в .env
- [ ] Service Worker зарегистрирован и активен
- [ ] Разрешения на уведомления выданы
- [ ] База данных содержит активные подписки
- [ ] Backend может подключиться к push-сервису
- [ ] Иконки существуют в public директории
- [ ] Нет блокировщиков рекламы, мешающих SW

### 9. Полезные команды

```bash
# Проверка VAPID ключей
openssl ec -in <(echo "$VAPID_PRIVATE_KEY" | base64 -d) -text -noout

# Тест связи с FCM (для Chrome)
curl -I https://fcm.googleapis.com/fcm/send

# Проверка заголовков CORS
curl -I -X OPTIONS http://localhost:4000/api/notifications/subscribe \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"
```