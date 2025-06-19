#!/bin/bash

# Скрипт для обновления приложения после изменений
# Запускать от имени пользователя aso_store

set -e

DEPLOY_DIR="/var/www/aso_store"

echo "=== Обновление ASO Store ==="

cd $DEPLOY_DIR

# Получение последних изменений
echo "Получение изменений из репозитория..."
git pull origin main

# Установка зависимостей если package.json изменился
if git diff HEAD@{1} --name-only | grep -E "package.*\.json|package-lock\.json"; then
    echo "Обнаружены изменения в зависимостях, установка..."
    npm install
fi

# Backend
cd backend

# Проверка изменений в схеме Prisma
if git diff HEAD@{1} --name-only | grep "prisma/schema.prisma"; then
    echo "Обнаружены изменения в схеме БД..."
    npx prisma generate
    npx prisma migrate deploy
fi

# Пересборка backend если есть изменения
if git diff HEAD@{1} --name-only | grep -E "backend/.*\.(ts|js|json)$"; then
    echo "Сборка backend..."
    npm run build
    BACKEND_CHANGED=true
fi

cd ../frontend

# Пересборка frontend если есть изменения
if git diff HEAD@{1} --name-only | grep -E "frontend/.*\.(ts|tsx|js|jsx|css|json)$"; then
    echo "Сборка frontend..."
    npm run build
    FRONTEND_CHANGED=true
fi

cd ..

# Перезапуск сервисов если были изменения
if [ "$BACKEND_CHANGED" = true ]; then
    echo "Перезапуск backend..."
    pm2 reload aso-backend
fi

if [ "$FRONTEND_CHANGED" = true ]; then
    echo "Перезапуск frontend..."
    pm2 reload aso-frontend
fi

echo "=== Обновление завершено ==="
pm2 status