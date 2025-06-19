#!/bin/bash

# Скрипт для восстановления из резервной копии
# Запускать от имени пользователя aso_store

set -e

BACKUP_DIR="/var/backups/aso_store"
DEPLOY_DIR="/var/www/aso_store"
DB_NAME="aso_store_prod"
DB_USER="aso_user"

if [ "$#" -ne 1 ]; then
  echo "Использование: $0 <дата_бэкапа>"
  echo "Пример: $0 20240115_143022"
  echo ""
  echo "Доступные резервные копии:"
  ls -1 $BACKUP_DIR | grep -E "^db_backup_[0-9]+_[0-9]+\.sql\.gz$" | sed 's/db_backup_//;s/\.sql\.gz//' | tail -10
  exit 1
fi

BACKUP_DATE=$1

echo "=== Восстановление ASO Store из резервной копии от $BACKUP_DATE ==="

# Проверка наличия файлов
if [ ! -f "$BACKUP_DIR/db_backup_$BACKUP_DATE.sql.gz" ]; then
  echo "❌ Резервная копия базы данных не найдена: $BACKUP_DIR/db_backup_$BACKUP_DATE.sql.gz"
  exit 1
fi

# Подтверждение
echo "⚠️  ВНИМАНИЕ: Это действие перезапишет текущие данные!"
echo "Будут восстановлены:"
[ -f "$BACKUP_DIR/db_backup_$BACKUP_DATE.sql.gz" ] && echo "  - База данных"
[ -f "$BACKUP_DIR/uploads_backup_$BACKUP_DATE.tar.gz" ] && echo "  - Загруженные файлы"
[ -f "$BACKUP_DIR/config_backup_$BACKUP_DATE.tar.gz" ] && echo "  - Конфигурационные файлы"

read -p "Продолжить? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Отменено"
  exit 0
fi

# Остановка приложения
echo "Остановка приложения..."
pm2 stop aso-backend aso-frontend

# 1. Восстановление базы данных
echo "Восстановление базы данных..."
gunzip -c "$BACKUP_DIR/db_backup_$BACKUP_DATE.sql.gz" | psql -U $DB_USER -d $DB_NAME
echo "✅ База данных восстановлена"

# 2. Восстановление загруженных файлов
if [ -f "$BACKUP_DIR/uploads_backup_$BACKUP_DATE.tar.gz" ]; then
  echo "Восстановление загруженных файлов..."
  rm -rf "$DEPLOY_DIR/uploads"
  tar -xzf "$BACKUP_DIR/uploads_backup_$BACKUP_DATE.tar.gz" -C "$DEPLOY_DIR"
  echo "✅ Файлы восстановлены"
fi

# 3. Восстановление конфигурации (опционально)
if [ -f "$BACKUP_DIR/config_backup_$BACKUP_DATE.tar.gz" ]; then
  read -p "Восстановить конфигурационные файлы? (yes/no): " restore_config
  if [ "$restore_config" = "yes" ]; then
    echo "Восстановление конфигурации..."
    tar -xzf "$BACKUP_DIR/config_backup_$BACKUP_DATE.tar.gz" -C /
    echo "✅ Конфигурация восстановлена"
  fi
fi

# Запуск приложения
echo "Запуск приложения..."
pm2 start aso-backend aso-frontend

echo "=== Восстановление завершено ==="
pm2 status