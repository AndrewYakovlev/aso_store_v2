# Инструкция по развертыванию ASO Store на VPS

## 🚀 Автоматическое развертывание через GitHub Actions

После настройки GitHub Actions (см. [GITHUB_ACTIONS_SETUP.md](../.github/GITHUB_ACTIONS_SETUP.md)), развертывание происходит автоматически при push в master ветку.

### Ручное развертывание через GitHub Actions:
1. Перейдите в Actions → Deploy to Production
2. Нажмите "Run workflow"
3. Выберите опции и запустите

---

## 📋 Ручное развертывание на VPS

## Требования

- Ubuntu 20.04+ 
- Node.js 18+
- PostgreSQL 14+
- Nginx
- Git
- PM2

## Первоначальная настройка

### 1. Подготовка сервера

```bash
# Подключитесь к серверу по SSH
ssh root@your-server-ip

# Обновите систему
apt update && apt upgrade -y

# Установите необходимые пакеты (если еще не установлены)
apt install -y nginx postgresql nodejs npm git

# Создайте пользователя для приложения
useradd -m -s /bin/bash aso_store
```

### 2. Настройка PostgreSQL

```bash
# Создайте базу данных
sudo -u postgres psql < /path/to/deploy/create-database.sql

# Обязательно измените пароль в файле create-database.sql!
```

### 3. Настройка директорий

```bash
# Выполните скрипт настройки
chmod +x deploy/setup-server.sh
sudo ./deploy/setup-server.sh
```

### 4. Подготовка конфигурационных файлов

```bash
# Переключитесь на пользователя aso_store
su - aso_store

# Клонируйте репозиторий
cd /var/www/aso_store
git clone https://github.com/your-username/aso_store_v2.git .

# Создайте .env файлы
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env.local

# Отредактируйте файлы, установив правильные значения:
nano backend/.env
# - DATABASE_URL с вашим паролем
# - JWT секреты (сгенерируйте случайные строки)
# - CORS_ORIGIN с вашим доменом

nano frontend/.env.local  
# - Замените your-domain.com на ваш домен
```

### 5. Первое развертывание

```bash
# Сделайте скрипт исполняемым
chmod +x deploy/deploy.sh

# Запустите развертывание
./deploy/deploy.sh
```

### 6. Настройка Nginx

```bash
# Вернитесь под root
exit

# Скопируйте конфигурацию nginx
cp /var/www/aso_store/deploy/nginx.conf /etc/nginx/sites-available/aso_store

# Отредактируйте конфигурацию
nano /etc/nginx/sites-available/aso_store
# Замените your-domain.com на ваш домен

# Активируйте сайт
ln -s /etc/nginx/sites-available/aso_store /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 7. Настройка SSL (опционально, но рекомендуется)

```bash
# Установите Certbot
apt install -y certbot python3-certbot-nginx

# Получите сертификат
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 8. Настройка firewall

```bash
# Разрешите необходимые порты
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## Обновление приложения

Для обновления после внесения изменений:

```bash
su - aso_store
cd /var/www/aso_store
chmod +x deploy/update.sh
./deploy/update.sh
```

## Управление приложением

### Просмотр статуса
```bash
pm2 status
```

### Просмотр логов
```bash
pm2 logs aso-backend
pm2 logs aso-frontend
```

### Перезапуск
```bash
pm2 restart aso-backend
pm2 restart aso-frontend
```

### Мониторинг
```bash
pm2 monit
```

## Создание администратора

После развертывания создайте администратора:

```bash
cd /var/www/aso_store/backend
npm run seed:admin
```

## Troubleshooting

### Ошибки при сборке
- Проверьте логи: `pm2 logs`
- Убедитесь, что все переменные окружения установлены правильно
- Проверьте доступность базы данных

### Ошибки Nginx
- Проверьте конфигурацию: `nginx -t`
- Просмотрите логи: `tail -f /var/log/nginx/error.log`

### Проблемы с правами доступа
- Убедитесь, что пользователь aso_store владеет всеми файлами:
  ```bash
  chown -R aso_store:aso_store /var/www/aso_store
  ```

## Резервное копирование

Не забудьте настроить регулярное резервное копирование:
- База данных PostgreSQL
- Директория uploads
- Конфигурационные файлы .env