# Ручной деплой на Ubuntu VPS

## Требования
- Ubuntu 20.04/22.04 VPS
- Минимум 2GB RAM
- Node.js 20.x
- PostgreSQL 15+
- Nginx
- PM2
- Git

## 1. Первоначальная настройка сервера

### Подключение по SSH
```bash
ssh root@andrewdev.ru
```

### Обновление системы
```bash
apt update && apt upgrade -y
```

### Установка необходимых пакетов
```bash
# Базовые утилиты
apt install -y curl wget git build-essential

# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# PostgreSQL
apt install -y postgresql postgresql-contrib

# Nginx
apt install -y nginx

# PM2
npm install -g pm2
```

## 2. Настройка PostgreSQL

### Создание базы данных
```bash
sudo -u postgres psql

CREATE DATABASE aso_store;
CREATE USER aso_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE aso_store TO aso_user;
\q
```

## 3. Клонирование и настройка приложения

### Создание директории и клонирование
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/AndrewYakovlev/aso_store_v2.git
cd aso_store_v2
```

### Установка зависимостей
```bash
npm install
```

### Настройка Backend (.env файл)
```bash
cd backend
cp .env.example .env
nano .env
```

Отредактируйте файл:
```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL="postgresql://aso_user:your_secure_password@localhost:5432/aso_store"

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# SMS (для демо можно использовать моковый провайдер)
SMS_PROVIDER=mock
SMS_API_KEY=mock_key

# Frontend URL
FRONTEND_URL=https://andrewdev.ru

# CORS
CORS_ORIGINS=https://andrewdev.ru

# Admin user
ADMIN_PHONE=+79991234567
```

### Настройка Frontend (.env файл)
```bash
cd ../frontend
cp .env.example .env.production
nano .env.production
```

Отредактируйте файл:
```env
NEXT_PUBLIC_API_URL=https://andrewdev.ru/api
NEXT_PUBLIC_WS_URL=wss://andrewdev.ru
```

### Запуск миграций
```bash
cd ../backend
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

## 4. Сборка приложений

### Backend
```bash
cd /var/www/aso_store_v2/backend
npm run build
```

### Frontend
```bash
cd /var/www/aso_store_v2/frontend
npm run build
```

## 5. Настройка PM2

### Создание конфигурации PM2
```bash
cd /var/www/aso_store_v2
nano ecosystem.config.js
```

Содержимое файла:
```javascript
module.exports = {
  apps: [
    {
      name: 'aso-backend',
      cwd: './backend',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
    },
    {
      name: 'aso-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
    }
  ]
};
```

### Запуск приложений
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 6. Настройка Nginx

### Создание конфигурации
```bash
nano /etc/nginx/sites-available/andrewdev.ru
```

Содержимое файла:
```nginx
server {
    listen 80;
    server_name andrewdev.ru www.andrewdev.ru;
    
    # Редирект на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name andrewdev.ru www.andrewdev.ru;

    # SSL сертификаты (настроить позже через Certbot)
    # ssl_certificate /etc/letsencrypt/live/andrewdev.ru/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/andrewdev.ru/privkey.pem;

    # Логи
    access_log /var/log/nginx/andrewdev.ru.access.log;
    error_log /var/log/nginx/andrewdev.ru.error.log;

    # Увеличиваем размер загружаемых файлов
    client_max_body_size 10M;

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket для чата
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Загруженные файлы
    location /uploads {
        alias /var/www/aso_store_v2/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Активация конфигурации
```bash
ln -s /etc/nginx/sites-available/andrewdev.ru /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 7. Настройка SSL (опционально, но рекомендуется)

```bash
# Установка Certbot
apt install -y certbot python3-certbot-nginx

# Получение сертификата
certbot --nginx -d andrewdev.ru -d www.andrewdev.ru
```

## 8. Команды для управления

### Обновление кода
```bash
cd /var/www/aso_store_v2
git pull origin main
```

### Пересборка и перезапуск Backend
```bash
cd /var/www/aso_store_v2/backend
npm install
npm run build
pm2 restart aso-backend
```

### Пересборка и перезапуск Frontend
```bash
cd /var/www/aso_store_v2/frontend
npm install
npm run build
pm2 restart aso-frontend
```

### Просмотр логов
```bash
# Все логи
pm2 logs

# Только backend
pm2 logs aso-backend

# Только frontend
pm2 logs aso-frontend
```

### Мониторинг
```bash
# Статус процессов
pm2 status

# Мониторинг в реальном времени
pm2 monit
```

### Перезапуск всех сервисов
```bash
pm2 restart all
```

## 9. Создание скрипта для быстрого обновления

Создайте файл `/var/www/aso_store_v2/deploy.sh`:
```bash
#!/bin/bash

echo "🚀 Начинаем обновление..."

# Переходим в директорию проекта
cd /var/www/aso_store_v2

# Получаем последние изменения
echo "📥 Получаем обновления из Git..."
git pull origin main

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Backend
echo "🔧 Собираем Backend..."
cd backend
npm run build
echo "♻️  Перезапускаем Backend..."
pm2 restart aso-backend

# Frontend
echo "🎨 Собираем Frontend..."
cd ../frontend
npm run build
echo "♻️  Перезапускаем Frontend..."
pm2 restart aso-frontend

echo "✅ Обновление завершено!"
pm2 status
```

Сделайте скрипт исполняемым:
```bash
chmod +x /var/www/aso_store_v2/deploy.sh
```

### Использование скрипта
```bash
/var/www/aso_store_v2/deploy.sh
```

## 10. Проверка работоспособности

1. Откройте https://andrewdev.ru в браузере
2. Проверьте основные функции:
   - Главная страница
   - Каталог товаров
   - Регистрация/вход
   - Корзина
   - Оформление заказа
   - Админ-панель (/panel)

## Возможные проблемы и решения

### Ошибка 502 Bad Gateway
- Проверьте, запущены ли приложения: `pm2 status`
- Проверьте логи: `pm2 logs`

### Ошибки при сборке
- Убедитесь, что установлена правильная версия Node.js: `node --version`
- Очистите кеш npm: `npm cache clean --force`

### Проблемы с базой данных
- Проверьте подключение: `sudo -u postgres psql -d aso_store`
- Проверьте миграции: `cd backend && npx prisma migrate status`

### Нехватка памяти
- Добавьте swap файл:
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## Контакты для поддержки

При возникновении проблем проверьте:
1. Логи PM2: `pm2 logs`
2. Логи Nginx: `tail -f /var/log/nginx/andrewdev.ru.error.log`
3. Системные логи: `journalctl -xe`