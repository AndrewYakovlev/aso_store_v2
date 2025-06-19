#!/bin/bash

# Скрипт развертывания ASO Store
# Запускать от имени пользователя aso_store

set -e

DEPLOY_DIR="/var/www/aso_store"
REPO_URL="https://github.com/your-username/aso_store_v2.git" # Замените на ваш репозиторий
BRANCH="master"

echo "=== Начало развертывания ASO Store ==="

# Переход в директорию
cd $DEPLOY_DIR

# Клонирование или обновление репозитория
if [ ! -d ".git" ]; then
    echo "Клонирование репозитория..."
    git clone $REPO_URL .
else
    echo "Обновление репозитория..."
    git fetch origin
    git reset --hard origin/$BRANCH
fi

# Копирование .env файлов (должны быть подготовлены заранее)
echo "Проверка конфигурационных файлов..."
if [ ! -f "backend/.env" ]; then
    echo "ОШИБКА: Создайте файл backend/.env на основе backend/.env.example"
    exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "ОШИБКА: Создайте файл frontend/.env.local"
    exit 1
fi

# Установка зависимостей
echo "Установка зависимостей..."
npm install

# Backend
echo "=== Сборка Backend ==="
cd backend

# Генерация Prisma Client
echo "Генерация Prisma Client..."
npx prisma generate

# Миграции базы данных
echo "Применение миграций..."
npx prisma migrate deploy

# Сборка backend
echo "Сборка backend..."
npm run build

cd ..

# Frontend
echo "=== Сборка Frontend ==="
cd frontend

# Сборка frontend
echo "Сборка frontend..."
npm run build

cd ..

# Создание директории для uploads
mkdir -p uploads

# Установка прав
echo "Установка прав доступа..."
chmod -R 755 uploads

# Копирование PM2 конфигурации
cp deploy/ecosystem.config.js .

# Перезапуск приложений через PM2
echo "Перезапуск приложений..."
pm2 stop ecosystem.config.js || true
pm2 start ecosystem.config.js

# Сохранение конфигурации PM2
pm2 save

echo "=== Развертывание завершено успешно ==="
echo ""
echo "Проверьте статус приложений: pm2 status"
echo "Просмотр логов: pm2 logs"
echo ""
echo "Не забудьте:"
echo "1. Настроить Nginx (sudo nginx -s reload)"
echo "2. Настроить SSL сертификат (certbot)"
echo "3. Настроить firewall (ufw)"