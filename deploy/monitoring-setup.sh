#!/bin/bash

# Скрипт для настройки мониторинга и автоматизации
# Запускать от имени root

set -e

echo "=== Настройка мониторинга для ASO Store ==="

# 1. Создание директорий
echo "Создание директорий..."
mkdir -p /var/log/aso_store
mkdir -p /var/backups/aso_store
chown aso_store:aso_store /var/log/aso_store
chown aso_store:aso_store /var/backups/aso_store

# 2. Настройка logrotate
echo "Настройка ротации логов..."
cat > /etc/logrotate.d/aso_store << 'EOF'
/var/log/aso_store/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 aso_store aso_store
    sharedscripts
    postrotate
        /usr/bin/pm2 reloadLogs
    endscript
}
EOF

# 3. Настройка cron задач
echo "Настройка cron задач..."

# Добавляем задачи для пользователя aso_store
cat > /tmp/aso_store_cron << 'EOF'
# Проверка здоровья каждые 5 минут
*/5 * * * * /var/www/aso_store/deploy/health-check.sh > /dev/null 2>&1

# Резервное копирование каждый день в 3:00
0 3 * * * /var/www/aso_store/deploy/backup.sh > /var/log/aso_store/backup.log 2>&1

# Очистка старых логов PM2 каждую неделю
0 0 * * 0 /usr/bin/pm2 flush > /dev/null 2>&1

# Перезапуск PM2 процессов каждую ночь в 4:00 (опционально)
# 0 4 * * * /usr/bin/pm2 restart all > /dev/null 2>&1
EOF

# Установка cron задач
crontab -u aso_store /tmp/aso_store_cron
rm /tmp/aso_store_cron

# 4. Настройка системного сервиса для PM2
echo "Настройка PM2 как системного сервиса..."
su - aso_store -c "pm2 startup systemd -u aso_store --hp /home/aso_store" | tail -n 1 | bash
su - aso_store -c "pm2 save"

# 5. Настройка мониторинга Nginx логов
echo "Настройка мониторинга Nginx..."
cat > /etc/logrotate.d/nginx-aso << 'EOF'
/var/log/nginx/aso_store_*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF

# 6. Создание скрипта для отправки отчетов
cat > /var/www/aso_store/deploy/daily-report.sh << 'EOF'
#!/bin/bash

# Ежедневный отчет о состоянии системы

REPORT="/tmp/aso_daily_report_$(date +%Y%m%d).txt"

echo "=== Ежедневный отчет ASO Store $(date) ===" > $REPORT
echo "" >> $REPORT

# Статус процессов
echo "## Статус процессов:" >> $REPORT
pm2 list >> $REPORT
echo "" >> $REPORT

# Использование ресурсов
echo "## Использование ресурсов:" >> $REPORT
echo "### Диск:" >> $REPORT
df -h >> $REPORT
echo "" >> $REPORT

echo "### Память:" >> $REPORT
free -h >> $REPORT
echo "" >> $REPORT

echo "### CPU (top 10 процессов):" >> $REPORT
ps aux --sort=-%cpu | head -11 >> $REPORT
echo "" >> $REPORT

# Статистика Nginx за последние 24 часа
echo "## Статистика запросов (последние 24 часа):" >> $REPORT
echo "Всего запросов: $(grep -c "" /var/log/nginx/aso_store_access.log 2>/dev/null || echo 0)" >> $REPORT
echo "Ошибки 5xx: $(grep -c " 5[0-9][0-9] " /var/log/nginx/aso_store_access.log 2>/dev/null || echo 0)" >> $REPORT
echo "Ошибки 4xx: $(grep -c " 4[0-9][0-9] " /var/log/nginx/aso_store_access.log 2>/dev/null || echo 0)" >> $REPORT
echo "" >> $REPORT

# Последние ошибки из PM2
echo "## Последние ошибки приложения:" >> $REPORT
pm2 logs --lines 50 --nostream | grep -i "error" | tail -10 >> $REPORT 2>/dev/null || echo "Ошибок не найдено" >> $REPORT

# Отправка отчета (если настроена почта)
# cat $REPORT | mail -s "ASO Store Daily Report $(date +%Y-%m-%d)" admin@aso-store.com

# Сохранение отчета
mv $REPORT /var/log/aso_store/

echo "Отчет сохранен: /var/log/aso_store/$(basename $REPORT)"
EOF

chmod +x /var/www/aso_store/deploy/daily-report.sh
chmod +x /var/www/aso_store/deploy/health-check.sh
chmod +x /var/www/aso_store/deploy/backup.sh
chmod +x /var/www/aso_store/deploy/restore.sh

# 7. Добавление ежедневного отчета в cron
echo "0 6 * * * /var/www/aso_store/deploy/daily-report.sh > /dev/null 2>&1" | crontab -u aso_store -

echo "=== Настройка мониторинга завершена ==="
echo ""
echo "Настроены следующие задачи:"
echo "- Проверка здоровья каждые 5 минут"
echo "- Резервное копирование каждый день в 3:00"
echo "- Ротация логов"
echo "- PM2 как системный сервис"
echo "- Ежедневный отчет в 6:00"
echo ""
echo "Проверьте cron задачи: crontab -u aso_store -l"