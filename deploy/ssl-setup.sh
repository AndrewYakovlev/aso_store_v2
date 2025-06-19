#!/bin/bash

# Скрипт для автоматической настройки SSL сертификатов
# Запускать от имени root

set -e

if [ "$#" -ne 2 ]; then
  echo "Использование: $0 <domain.com> <email@domain.com>"
  exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "=== Настройка SSL для $DOMAIN ==="

# 1. Установка Certbot если не установлен
if ! command -v certbot &> /dev/null; then
  echo "Установка Certbot..."
  apt update
  apt install -y certbot python3-certbot-nginx
fi

# 2. Проверка конфигурации Nginx
echo "Проверка конфигурации Nginx..."
if ! nginx -t; then
  echo "❌ Ошибка в конфигурации Nginx. Исправьте ошибки и запустите скрипт снова."
  exit 1
fi

# 3. Получение сертификата
echo "Получение SSL сертификата..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# 4. Настройка автоматического обновления
echo "Настройка автоматического обновления сертификатов..."
cat > /etc/cron.d/certbot-aso << EOF
# Проверка и обновление сертификатов дважды в день
0 2,14 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

# 5. Усиление безопасности SSL
echo "Усиление безопасности SSL..."
cat > /etc/nginx/snippets/ssl-params.conf << 'EOF'
# Современные SSL параметры
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;

# SSL оптимизация
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;

# OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Security headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
EOF

# 6. Обновление конфигурации Nginx для использования ssl-params
sed -i '/listen 443 ssl http2;/a \    include /etc/nginx/snippets/ssl-params.conf;' /etc/nginx/sites-available/aso_store

# 7. Перезагрузка Nginx
echo "Перезагрузка Nginx..."
nginx -t && systemctl reload nginx

# 8. Тест SSL
echo -e "\n=== Настройка SSL завершена ==="
echo "Проверьте ваш сайт:"
echo "- https://$DOMAIN"
echo "- https://www.$DOMAIN"
echo ""
echo "Проверьте SSL рейтинг на:"
echo "https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
echo "Сертификаты будут автоматически обновляться каждые 60-90 дней."