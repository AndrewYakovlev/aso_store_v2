# Чек-лист развертывания ASO Store

## Перед развертыванием (локально)

- [ ] Запустить проверку готовности: `bash deploy/check-deployment.sh`
- [ ] Убедиться, что все тесты проходят
- [ ] Проверить, что нет незакоммиченных изменений: `git status`
- [ ] Создать тег версии: `git tag -a v1.0.0 -m "Initial deployment"`
- [ ] Отправить изменения в репозиторий: `git push origin master --tags`

## Подготовка сервера

- [ ] Подключиться к серверу: `ssh root@your-server-ip`
- [ ] Обновить систему: `apt update && apt upgrade -y`
- [ ] Установить необходимое ПО (если не установлено):
  ```bash
  apt install -y nginx postgresql nodejs npm git curl
  npm install -g pm2
  ```
- [ ] Создать пользователя: `useradd -m -s /bin/bash aso_store`
- [ ] Настроить PostgreSQL:
  - [ ] Изменить пароль в `create-database.sql`
  - [ ] Выполнить: `sudo -u postgres psql < create-database.sql`

## Развертывание приложения

- [ ] Выполнить setup скрипт: `bash deploy/setup-server.sh`
- [ ] Переключиться на пользователя: `su - aso_store`
- [ ] Перейти в директорию: `cd /var/www/aso_store`
- [ ] Клонировать репозиторий: `git clone YOUR_REPO_URL .`
- [ ] Настроить переменные окружения:
  - [ ] `cp backend/.env.production backend/.env`
  - [ ] `cp frontend/.env.production frontend/.env.local`
  - [ ] Отредактировать `.env` файлы с реальными значениями
- [ ] Запустить развертывание: `bash deploy/deploy.sh`

## Настройка веб-сервера

- [ ] Вернуться под root: `exit`
- [ ] Скопировать конфигурацию Nginx:
  ```bash
  cp /var/www/aso_store/deploy/nginx.conf /etc/nginx/sites-available/aso_store
  ```
- [ ] Отредактировать конфигурацию (заменить домен)
- [ ] Активировать сайт:
  ```bash
  ln -s /etc/nginx/sites-available/aso_store /etc/nginx/sites-enabled/
  nginx -t
  systemctl reload nginx
  ```

## Настройка SSL (обязательно для production)

- [ ] Настроить DNS записи (A записи для domain.com и www.domain.com)
- [ ] Подождать распространения DNS (проверить: `dig domain.com`)
- [ ] Запустить SSL настройку: `bash /var/www/aso_store/deploy/ssl-setup.sh domain.com email@domain.com`

## Настройка мониторинга

- [ ] Запустить настройку мониторинга: `bash /var/www/aso_store/deploy/monitoring-setup.sh`
- [ ] Проверить cron задачи: `crontab -u aso_store -l`
- [ ] Проверить работу health check: `su - aso_store -c "/var/www/aso_store/deploy/health-check.sh"`

## Финальные проверки

- [ ] Проверить статус PM2: `su - aso_store -c "pm2 status"`
- [ ] Проверить логи: `su - aso_store -c "pm2 logs"`
- [ ] Открыть сайт в браузере: `https://your-domain.com`
- [ ] Проверить API: `https://your-domain.com/api`
- [ ] Проверить WebSocket соединение (открыть чат)
- [ ] Создать тестового администратора: 
  ```bash
  su - aso_store
  cd /var/www/aso_store/backend
  npm run seed:admin
  ```

## Настройка firewall

- [ ] Настроить ufw:
  ```bash
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw enable
  ```

## Резервное копирование

- [ ] Проверить работу backup скрипта:
  ```bash
  su - aso_store -c "/var/www/aso_store/deploy/backup.sh"
  ```
- [ ] Проверить, что backup создался: `ls -la /var/backups/aso_store/`

## Документация для команды

- [ ] Сохранить все пароли в безопасном месте
- [ ] Документировать:
  - IP адрес сервера
  - SSH доступы
  - Пароль от БД
  - JWT секреты
  - Домен и DNS настройки

## Мониторинг после запуска

### Первый день
- [ ] Проверять логи каждые несколько часов
- [ ] Мониторить использование ресурсов
- [ ] Проверить, что backup выполнился ночью

### Первая неделя
- [ ] Ежедневно проверять health check логи
- [ ] Проверять ежедневные отчеты
- [ ] Мониторить производительность

## Troubleshooting

### Если сайт не открывается
1. Проверить PM2: `pm2 status`
2. Проверить Nginx: `systemctl status nginx`
3. Проверить логи: `pm2 logs`
4. Проверить порты: `netstat -tlpn`

### Если не работает WebSocket
1. Проверить Nginx конфигурацию (секция location /socket.io/)
2. Проверить CORS настройки в backend/.env
3. Проверить логи backend: `pm2 logs aso-backend`

### Если высокая нагрузка
1. Проверить PM2 мониторинг: `pm2 monit`
2. Увеличить количество инстансов в ecosystem.config.js
3. Проверить медленные запросы в PostgreSQL

## Обновление после изменений

```bash
ssh aso_store@your-server-ip
cd /var/www/aso_store
bash deploy/update.sh
```