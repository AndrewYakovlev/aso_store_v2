# Настройка GitHub Actions для ASO Store

## Необходимые секреты

Перейдите в Settings → Secrets and variables → Actions в вашем репозитории и добавьте следующие секреты:

### Для развертывания

- `SSH_PRIVATE_KEY` - приватный SSH ключ для доступа к серверу
- `SERVER_HOST` - IP адрес или домен вашего сервера
- `SERVER_USER` - имя пользователя на сервере (обычно `aso_store`)

### Для staging (опционально)

- `STAGING_HOST` - адрес staging сервера
- `STAGING_USER` - пользователь на staging сервере

### Для резервного копирования в S3 (опционально)

- `AWS_ACCESS_KEY_ID` - ключ доступа AWS
- `AWS_SECRET_ACCESS_KEY` - секретный ключ AWS
- `AWS_DEFAULT_REGION` - регион AWS (например, `eu-central-1`)
- `S3_BACKUP_BUCKET` - имя S3 bucket для бэкапов

### Для уведомлений (опционально)

- `SLACK_WEBHOOK` - webhook URL для Slack уведомлений

## Настройка SSH доступа

1. На локальной машине создайте SSH ключ (если еще нет):
   ```bash
   ssh-keygen -t ed25519 -C "github-actions@aso-store"
   ```

2. Добавьте публичный ключ на сервер:
   ```bash
   ssh-copy-id -i ~/.ssh/id_ed25519.pub aso_store@your-server-ip
   ```

3. Скопируйте приватный ключ и добавьте его в GitHub Secrets:
   ```bash
   cat ~/.ssh/id_ed25519
   ```

## Описание workflows

### 1. CI (ci.yml)
- Запускается при push в master/develop и при PR
- Тестирует backend и frontend
- Проверяет безопасность
- Выполняет сборку

### 2. Deploy (deploy.yml)
- Запускается при push в master
- Можно запустить вручную через GitHub UI
- Опция пропуска тестов для экстренных случаев
- Автоматический откат при неудаче

### 3. Staging (staging.yml)
- Запускается при push в develop
- Можно запустить для PR с меткой `deploy-staging`
- Для предварительного тестирования

### 4. Backup (backup.yml)
- Автоматически каждый день в 3:00 UTC
- Можно запустить вручную
- Типы: full, database, files

### 5. Security (security.yml)
- Еженедельная проверка безопасности
- Проверка зависимостей
- Сканирование кода

## Использование

### Автоматическое развертывание

После настройки секретов, каждый push в master будет автоматически развертываться на production сервере.

### Ручное развертывание

1. Перейдите в Actions → Deploy to Production
2. Нажмите "Run workflow"
3. Выберите ветку и опции
4. Нажмите "Run workflow"

### Создание резервной копии

1. Перейдите в Actions → Scheduled Backup
2. Нажмите "Run workflow"
3. Выберите тип бэкапа
4. Нажмите "Run workflow"

## Мониторинг

- Проверяйте статус workflows в разделе Actions
- Настройте уведомления в Settings → Notifications
- При ошибках смотрите логи конкретного workflow

## Troubleshooting

### SSH connection refused
- Проверьте, что SSH ключ добавлен правильно
- Проверьте, что пользователь существует на сервере
- Проверьте firewall настройки

### Tests failing
- Проверьте логи в CI workflow
- Убедитесь, что все переменные окружения настроены
- Проверьте версии Node.js и зависимостей

### Deployment rollback
- Автоматический откат происходит при неудачном health check
- Ручной откат: подключитесь к серверу и выполните:
  ```bash
  cd /var/www/aso_store
  git log --oneline -10  # найдите нужный коммит
  git reset --hard <commit-hash>
  bash deploy/update.sh
  ```