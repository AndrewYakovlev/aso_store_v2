# 🚀 Быстрые команды для ASO Store

## Команды которые нужно выполнить на вашем компьютере:

### 1. Создание SSH ключа (выполнить один раз)
```bash
ssh-keygen -t ed25519 -C "github-actions@aso-store" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions      # Скопируйте это в GitHub Secret SSH_PRIVATE_KEY
cat ~/.ssh/github_actions.pub  # Скопируйте это для сервера
```

### 2. Обновление проекта и отправка на GitHub
```bash
cd путь/к/aso_store_v2
git add .
git commit -m "Описание изменений"
git push origin main
```

---

## Команды для сервера (выполнять через SSH):

### Первое подключение к серверу:
```bash
ssh root@ВАШ_IP_АДРЕС
```

### Быстрая установка всего необходимого (для root):
```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Установка остальных пакетов
apt install -y nginx postgresql postgresql-contrib git curl build-essential
npm install -g pm2

# Создание пользователя
useradd -m -s /bin/bash aso_store
passwd aso_store  # Введите пароль
```

### Настройка базы данных (для root):
```bash
sudo -u postgres psql
```
Затем в PostgreSQL:
```sql
CREATE USER aso_user WITH PASSWORD 'true!false@';
CREATE DATABASE aso_store_prod OWNER aso_user;
GRANT ALL PRIVILEGES ON DATABASE aso_store_prod TO aso_user;
\q
```

### Переключение на пользователя aso_store:
```bash
su - aso_store
```

### Клонирование и развертывание (для aso_store):
```bash
cd /var/www/aso_store
git clone git@github.com:AndrewYakovlev/aso_store_v2.git .
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
nano backend/.env      # Отредактируйте файл
nano frontend/.env.local  # Отредактируйте файл
chmod +x deploy/*.sh
./deploy/deploy.sh
```

### Настройка Nginx (для root):
```bash
cp /var/www/aso_store/deploy/nginx.conf /etc/nginx/sites-available/aso_store
nano /etc/nginx/sites-available/aso_store  # Замените your-domain.com
rm /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/aso_store /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Настройка firewall (для root):
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## Команды для управления приложением:

### Проверка статуса:
```bash
pm2 status
```

### Просмотр логов:
```bash
pm2 logs
pm2 logs aso-backend
pm2 logs aso-frontend
```

### Перезапуск:
```bash
pm2 restart all
pm2 restart aso-backend
pm2 restart aso-frontend
```

### Обновление приложения после изменений:
```bash
cd /var/www/aso_store
./deploy/update.sh
```

### Создание резервной копии:
```bash
./deploy/backup.sh
```

### Проверка здоровья:
```bash
./deploy/health-check.sh
```

---

## Полезные команды для отладки:

### Проверка портов:
```bash
netstat -tlpn | grep -E '3000|4000'
```

### Проверка nginx:
```bash
nginx -t
systemctl status nginx
tail -f /var/log/nginx/error.log
```

### Проверка PostgreSQL:
```bash
systemctl status postgresql
psql -U aso_user -d aso_store_prod -h localhost
```

### Проверка места на диске:
```bash
df -h
```

### Проверка памяти:
```bash
free -h
```

---

## Создание администратора:
```bash
cd /var/www/aso_store/backend
npm run seed:admin
```

---

## SSL сертификат (если есть домен):
```bash
bash /var/www/aso_store/deploy/ssl-setup.sh ваш-домен.com ваш@email.com
```