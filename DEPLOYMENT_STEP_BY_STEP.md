# 🚀 Пошаговая инструкция развертывания ASO Store

## Часть 1: Подготовка на локальном компьютере

### Шаг 1: Создание SSH ключа для GitHub Actions

Откройте терминал на вашем компьютере и выполните:

```bash
# Создаем новый SSH ключ (просто нажмите Enter на все вопросы)
ssh-keygen -t ed25519 -C "github-actions@aso-store" -f ~/.ssh/github_actions -N ""

# Посмотрите содержимое приватного ключа (понадобится позже)
cat ~/.ssh/github_actions

# Посмотрите содержимое публичного ключа (тоже понадобится)
cat ~/.ssh/github_actions.pub
```

Сохраните оба ключа в блокнот - они понадобятся позже.

### Шаг 2: Настройка GitHub Secrets

1. Откройте ваш репозиторий на GitHub: https://github.com/AndrewYakovlev/aso_store_v2
2. Нажмите на "Settings" (в верхнем меню репозитория)
3. В левом меню найдите "Secrets and variables" → "Actions"
4. Нажмите кнопку "New repository secret"
5. Добавьте следующие секреты:

   **SSH_PRIVATE_KEY**:
   - Name: `SSH_PRIVATE_KEY`
   - Secret: вставьте содержимое приватного ключа (то что показала команда `cat ~/.ssh/github_actions`)
   
   **SERVER_HOST**:
   - Name: `SERVER_HOST`
   - Secret: IP адрес вашего VPS сервера (например: `185.123.45.67`)
   
   **SERVER_USER**:
   - Name: `SERVER_USER`
   - Secret: `aso_store` (это имя пользователя, которое мы создадим на сервере)

---

## Часть 2: Первоначальная настройка сервера

### Шаг 1: Подключение к серверу

```bash
# Подключитесь к вашему VPS серверу
ssh root@ВАШ_IP_АДРЕС_СЕРВЕРА
```

### Шаг 2: Обновление системы

После подключения выполните:

```bash
# Обновляем список пакетов
apt update

# Обновляем систему
apt upgrade -y
```

### Шаг 3: Установка необходимого ПО

```bash
# Устанавливаем Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Устанавливаем остальные необходимые пакеты
apt install -y nginx postgresql postgresql-contrib git curl build-essential

# Устанавливаем PM2 глобально
npm install -g pm2

# Проверяем версии
node --version  # должно показать v18.x.x
npm --version   # должно показать 9.x.x или выше
pm2 --version   # должно показать версию PM2
```

### Шаг 4: Создание пользователя для приложения

```bash
# Создаем нового пользователя
useradd -m -s /bin/bash aso_store

# Создаем пароль для пользователя (запомните его!)
passwd aso_store
```

### Шаг 5: Настройка SSH доступа для GitHub Actions

```bash
# Переключаемся на пользователя aso_store
su - aso_store

# Создаем SSH директорию
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Создаем файл authorized_keys
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Открываем файл для редактирования
nano ~/.ssh/authorized_keys
```

В открывшемся редакторе:
1. Вставьте содержимое публичного ключа (то что показала команда `cat ~/.ssh/github_actions.pub`)
2. Нажмите `Ctrl+X`, затем `Y`, затем `Enter` чтобы сохранить

```bash
# Возвращаемся к пользователю root
exit
```

### Шаг 6: Настройка PostgreSQL

```bash
# Переключаемся на пользователя postgres
sudo -u postgres psql

# В консоли PostgreSQL выполните команды (одну за другой):
CREATE USER aso_user WITH PASSWORD 'true!false@';
CREATE DATABASE aso_store_prod OWNER aso_user;
GRANT ALL PRIVILEGES ON DATABASE aso_store_prod TO aso_user;
\q
```

### Шаг 7: Создание директорий и клонирование репозитория

```bash
# Создаем директорию для приложения
mkdir -p /var/www/aso_store
chown aso_store:aso_store /var/www/aso_store

# Переключаемся на пользователя aso_store
su - aso_store

# Переходим в директорию
cd /var/www/aso_store

# Клонируем репозиторий
git clone git@github.com:AndrewYakovlev/aso_store_v2.git .
```

Если появится вопрос про fingerprint, введите `yes`.

### Шаг 8: Настройка переменных окружения

```bash
# Копируем файлы окружения
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env.local

# Редактируем backend/.env
nano backend/.env
```

В файле измените:
- `DATABASE_URL="postgresql://aso_user:true!false@@localhost:5432/aso_store_prod?schema=public"`
- `JWT_SECRET="сгенерируйте-случайную-строку-32-символа"`
- `JWT_REFRESH_SECRET="другая-случайная-строка-32-символа"`
- `CORS_ORIGIN="http://ваш-домен.com"` (или оставьте `http://ВАШ_IP_АДРЕС` если нет домена)

Сохраните: `Ctrl+X`, `Y`, `Enter`

```bash
# Редактируем frontend/.env.local
nano frontend/.env.local
```

В файле измените:
- Замените `your-domain.com` на ваш домен или IP адрес

Сохраните: `Ctrl+X`, `Y`, `Enter`

### Шаг 9: Первое развертывание

```bash
# Делаем скрипты исполняемыми
chmod +x deploy/*.sh

# Запускаем развертывание
./deploy/deploy.sh
```

Подождите пока скрипт выполнится (5-10 минут).

### Шаг 10: Настройка Nginx

```bash
# Возвращаемся к root
exit

# Копируем конфигурацию nginx
cp /var/www/aso_store/deploy/nginx.conf /etc/nginx/sites-available/aso_store

# Редактируем конфигурацию
nano /etc/nginx/sites-available/aso_store
```

Замените `your-domain.com` на ваш домен или IP адрес во всех местах.
Сохраните: `Ctrl+X`, `Y`, `Enter`

```bash
# Удаляем дефолтный сайт
rm /etc/nginx/sites-enabled/default

# Активируем наш сайт
ln -s /etc/nginx/sites-available/aso_store /etc/nginx/sites-enabled/

# Проверяем конфигурацию
nginx -t

# Перезагружаем nginx
systemctl reload nginx
```

### Шаг 11: Настройка firewall

```bash
# Настраиваем firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### Шаг 12: Создание администратора

```bash
# Переключаемся на пользователя aso_store
su - aso_store

# Переходим в backend
cd /var/www/aso_store/backend

# Создаем администратора
npm run seed:admin
```

Запомните логин и пароль администратора!

---

## Часть 3: Проверка работы

### Шаг 1: Проверка статуса

```bash
# Проверяем статус PM2
pm2 status

# Проверяем логи
pm2 logs
```

### Шаг 2: Открытие сайта

Откройте в браузере:
- `http://ВАШ_IP_АДРЕС` - главная страница
- `http://ВАШ_IP_АДРЕС/api` - API документация
- `http://ВАШ_IP_АДРЕС/panel` - админ панель

---

## Часть 4: Настройка автоматического развертывания

### Шаг 1: Обновление GitHub workflows

На вашем локальном компьютере:

```bash
# Переходим в директорию проекта
cd путь/к/aso_store_v2

# Обновляем файлы для использования main вместо master
```

Нужно обновить следующие файлы:
1. `.github/workflows/ci.yml` - заменить `master` на `main`
2. `.github/workflows/deploy.yml` - заменить `master` на `main`
3. `deploy/update.sh` - заменить `master` на `main`

После изменений:

```bash
# Коммитим изменения
git add .
git commit -m "fix: Update branch references from master to main"
git push origin main
```

### Шаг 2: Тестирование автоматического развертывания

Теперь при каждом push в ветку `main`, GitHub Actions автоматически:
1. Запустит тесты
2. Если тесты пройдут - развернет на сервер

---

## Часть 5: Установка домена и SSL (опционально)

Если у вас есть домен:

### Шаг 1: Настройка DNS

В панели управления вашего домена создайте A-записи:
- `@` → ВАШ_IP_АДРЕС
- `www` → ВАШ_IP_АДРЕС

### Шаг 2: Установка SSL сертификата

На сервере:

```bash
# От имени root
bash /var/www/aso_store/deploy/ssl-setup.sh ваш-домен.com ваш-email@example.com
```

---

## Проверочный список

- [ ] SSH ключи созданы и добавлены в GitHub Secrets
- [ ] Сервер обновлен и ПО установлено
- [ ] Пользователь aso_store создан
- [ ] База данных настроена
- [ ] Репозиторий склонирован
- [ ] Переменные окружения настроены
- [ ] Приложение развернуто и работает
- [ ] Nginx настроен
- [ ] Firewall настроен
- [ ] Администратор создан
- [ ] Сайт открывается в браузере

## Частые проблемы и решения

### Ошибка "Permission denied" при git clone
```bash
# Проверьте SSH ключ
ssh -T git@github.com
```

### PM2 не показывает процессы
```bash
# Перезапустите PM2
pm2 kill
pm2 resurrect
```

### Nginx выдает 502 Bad Gateway
```bash
# Проверьте, работают ли процессы
pm2 status
# Проверьте логи
pm2 logs
```

### База данных недоступна
```bash
# Проверьте статус PostgreSQL
systemctl status postgresql
# Проверьте подключение
psql -U aso_user -d aso_store_prod -h localhost
```

## Следующие шаги

1. Настройте мониторинг: `bash /var/www/aso_store/deploy/monitoring-setup.sh`
2. Проверьте резервное копирование: `bash /var/www/aso_store/deploy/backup.sh`
3. Изучите документацию в `.github/GITHUB_ACTIONS_SETUP.md`