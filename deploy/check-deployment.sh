#!/bin/bash

# Скрипт для проверки готовности к развертыванию
# Запускать на локальной машине перед деплоем

set -e

echo "=== Проверка готовности к развертыванию ==="

# Проверка наличия необходимых файлов
echo "Проверка конфигурационных файлов..."

required_files=(
  "deploy/setup-server.sh"
  "deploy/deploy.sh"
  "deploy/update.sh"
  "deploy/nginx.conf"
  "deploy/ecosystem.config.js"
  "deploy/create-database.sql"
  "backend/.env.production"
  "frontend/.env.production"
)

missing_files=()

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    missing_files+=("$file")
  fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
  echo "❌ Отсутствуют файлы:"
  for file in "${missing_files[@]}"; do
    echo "   - $file"
  done
  exit 1
fi

echo "✅ Все необходимые файлы присутствуют"

# Проверка сборки backend
echo -e "\nПроверка сборки backend..."
cd backend
if npm run build; then
  echo "✅ Backend собирается успешно"
else
  echo "❌ Ошибка сборки backend"
  exit 1
fi
cd ..

# Проверка сборки frontend
echo -e "\nПроверка сборки frontend..."
cd frontend
if npm run build; then
  echo "✅ Frontend собирается успешно"
else
  echo "❌ Ошибка сборки frontend"
  exit 1
fi
cd ..

# Проверка переменных окружения
echo -e "\nПроверка переменных окружения..."

if grep -q "your-domain.com\|your_password\|change-this" backend/.env.production frontend/.env.production; then
  echo "⚠️  ВНИМАНИЕ: Найдены шаблонные значения в .env файлах!"
  echo "   Не забудьте изменить их на реальные значения на сервере"
fi

# Проверка миграций
echo -e "\nПроверка миграций Prisma..."
cd backend
if npx prisma migrate status; then
  echo "✅ Миграции готовы к применению"
else
  echo "⚠️  Есть неприменённые миграции"
fi
cd ..

echo -e "\n=== Проверка завершена ==="
echo "Следующие шаги:"
echo "1. Закоммитьте все изменения: git add . && git commit -m 'Deploy configuration'"
echo "2. Отправьте изменения в репозиторий: git push origin master"
echo "3. Подключитесь к серверу и следуйте инструкциям в deploy/README.md"