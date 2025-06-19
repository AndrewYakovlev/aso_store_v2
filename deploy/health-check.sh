#!/bin/bash

# Скрипт для проверки здоровья приложения
# Можно использовать для мониторинга через cron

set -e

# Конфигурация
BACKEND_URL="http://localhost:4000/api/health"
FRONTEND_URL="http://localhost:3000"
ADMIN_EMAIL="admin@aso-store.com"
LOG_FILE="/var/log/aso_store/health-check.log"

# Создание директории для логов
mkdir -p $(dirname $LOG_FILE)

# Функция логирования
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Флаг для отслеживания ошибок
ERRORS=0

log "=== Проверка здоровья ASO Store ==="

# 1. Проверка PM2 процессов
log "Проверка PM2 процессов..."
if pm2 list | grep -q "aso-backend.*online"; then
  log "✅ Backend процесс работает"
else
  log "❌ Backend процесс не работает!"
  ERRORS=$((ERRORS + 1))
fi

if pm2 list | grep -q "aso-frontend.*online"; then
  log "✅ Frontend процесс работает"
else
  log "❌ Frontend процесс не работает!"
  ERRORS=$((ERRORS + 1))
fi

# 2. Проверка HTTP endpoints
log "Проверка HTTP endpoints..."

# Backend health check
if curl -f -s -o /dev/null -w "%{http_code}" $BACKEND_URL | grep -q "200"; then
  log "✅ Backend API отвечает"
else
  log "❌ Backend API не отвечает!"
  ERRORS=$((ERRORS + 1))
fi

# Frontend check
if curl -f -s -o /dev/null -w "%{http_code}" $FRONTEND_URL | grep -q "200"; then
  log "✅ Frontend отвечает"
else
  log "❌ Frontend не отвечает!"
  ERRORS=$((ERRORS + 1))
fi

# 3. Проверка базы данных
log "Проверка подключения к базе данных..."
if cd /var/www/aso_store/backend && npx prisma db pull --print 2>&1 | grep -q "Introspecting"; then
  log "✅ База данных доступна"
else
  log "❌ База данных недоступна!"
  ERRORS=$((ERRORS + 1))
fi

# 4. Проверка дискового пространства
log "Проверка дискового пространства..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 90 ]; then
  log "✅ Дисковое пространство: ${DISK_USAGE}% использовано"
else
  log "⚠️  Мало дискового пространства: ${DISK_USAGE}% использовано!"
  ERRORS=$((ERRORS + 1))
fi

# 5. Проверка памяти
log "Проверка использования памяти..."
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -lt 90 ]; then
  log "✅ Память: ${MEM_USAGE}% использовано"
else
  log "⚠️  Высокое использование памяти: ${MEM_USAGE}%!"
fi

# 6. Проверка логов на ошибки
log "Проверка логов на критические ошибки..."
ERROR_COUNT=$(pm2 logs --lines 100 --nostream | grep -c "ERROR\|FATAL" || true)
if [ $ERROR_COUNT -eq 0 ]; then
  log "✅ Критических ошибок в логах не найдено"
else
  log "⚠️  Найдено $ERROR_COUNT ошибок в последних логах"
fi

# Итоговый статус
log "=== Проверка завершена ==="
if [ $ERRORS -eq 0 ]; then
  log "✅ Все системы работают нормально"
  exit 0
else
  log "❌ Обнаружено $ERRORS проблем!"
  
  # Отправка уведомления (если настроено)
  # echo "ASO Store: Обнаружено $ERRORS проблем. Проверьте $LOG_FILE" | mail -s "ASO Store Health Check Failed" $ADMIN_EMAIL
  
  exit 1
fi