#!/bin/bash

# Скрипт для первоначальной настройки сервера
# Запускать с правами sudo

set -e

echo "=== Настройка сервера для ASO Store ==="

# Создание пользователя для приложения
if ! id -u aso_store > /dev/null 2>&1; then
    echo "Создание пользователя aso_store..."
    useradd -m -s /bin/bash aso_store
fi

# Создание директорий
echo "Создание директорий..."
mkdir -p /var/www/aso_store
mkdir -p /var/log/aso_store
chown -R aso_store:aso_store /var/www/aso_store
chown -R aso_store:aso_store /var/log/aso_store

# Установка PM2 глобально
echo "Установка PM2..."
npm install -g pm2

# Настройка PM2 для автозапуска
pm2 startup systemd -u aso_store --hp /home/aso_store

echo "=== Базовая настройка завершена ==="
echo "Следующие шаги:"
echo "1. Создайте базу данных PostgreSQL"
echo "2. Настройте Nginx (используйте nginx.conf из папки deploy)"
echo "3. Запустите deploy.sh для развертывания приложения"