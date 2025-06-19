#!/bin/bash

# Скрипт для создания резервных копий
# Запускать от имени пользователя aso_store или через cron

set -e

# Конфигурация
BACKUP_DIR="/var/backups/aso_store"
DEPLOY_DIR="/var/www/aso_store"
DB_NAME="aso_store_prod"
DB_USER="aso_user"
RETENTION_DAYS=7

# Создание директории для бэкапов
mkdir -p $BACKUP_DIR

# Текущая дата для имени файла
DATE=$(date +%Y%m%d_%H%M%S)

echo "=== Создание резервной копии ASO Store ==="

# 1. Бэкап базы данных
echo "Создание резервной копии базы данных..."
pg_dump -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/db_backup_$DATE.sql"
gzip "$BACKUP_DIR/db_backup_$DATE.sql"
echo "✅ База данных сохранена: db_backup_$DATE.sql.gz"

# 2. Бэкап загруженных файлов
if [ -d "$DEPLOY_DIR/uploads" ]; then
  echo "Создание резервной копии загруженных файлов..."
  tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" -C "$DEPLOY_DIR" uploads/
  echo "✅ Файлы сохранены: uploads_backup_$DATE.tar.gz"
fi

# 3. Бэкап конфигурационных файлов
echo "Создание резервной копии конфигурации..."
tar -czf "$BACKUP_DIR/config_backup_$DATE.tar.gz" \
  "$DEPLOY_DIR/backend/.env" \
  "$DEPLOY_DIR/frontend/.env.local" \
  "$DEPLOY_DIR/deploy/ecosystem.config.js" 2>/dev/null || true
echo "✅ Конфигурация сохранена: config_backup_$DATE.tar.gz"

# 4. Удаление старых бэкапов
echo "Удаление старых резервных копий (старше $RETENTION_DAYS дней)..."
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete

# 5. Показать размер бэкапов
echo -e "\nТекущие резервные копии:"
ls -lh $BACKUP_DIR/*.gz | tail -10

echo -e "\n=== Резервное копирование завершено ==="