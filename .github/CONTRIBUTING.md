# Contributing to ASO Store

## Процесс разработки

### 1. Создание веток

- `master` - production версия
- `develop` - основная ветка разработки
- `feature/*` - новые функции
- `bugfix/*` - исправления багов
- `hotfix/*` - срочные исправления для production

### 2. Workflow

1. Создайте ветку от `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Внесите изменения и закоммитьте:
   ```bash
   git add .
   git commit -m "feat: описание изменений"
   ```

3. Запустите тесты локально:
   ```bash
   npm run test
   npm run lint
   ```

4. Отправьте изменения:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Создайте Pull Request в `develop`

### 3. Commit Message Format

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - новая функциональность
- `fix:` - исправление бага
- `docs:` - изменения в документации
- `style:` - форматирование кода
- `refactor:` - рефакторинг
- `test:` - добавление тестов
- `chore:` - обновление зависимостей и т.д.

Примеры:
```
feat: добавить возможность экспорта заказов в Excel
fix: исправить ошибку при отправке SMS
docs: обновить инструкцию по развертыванию
```

### 4. Code Review

- Все PR должны быть проревьюены минимум одним разработчиком
- CI должен проходить успешно
- Код должен соответствовать стандартам проекта

### 5. Тестирование

Перед отправкой PR убедитесь:

- [ ] Все тесты проходят: `npm run test`
- [ ] Нет ошибок линтера: `npm run lint`
- [ ] Код собирается: `npm run build`
- [ ] Добавлены тесты для новой функциональности

### 6. Документация

- Обновите README.md при добавлении новых команд
- Документируйте API endpoints в Swagger
- Добавляйте JSDoc комментарии к сложным функциям

## Локальная разработка

### Настройка окружения

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/your-org/aso_store_v2.git
   cd aso_store_v2
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Настройте переменные окружения:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

4. Запустите базу данных и примените миграции:
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. Запустите приложение:
   ```bash
   npm run dev
   ```

### Полезные команды

```bash
# Запуск в режиме разработки
npm run dev

# Запуск только backend
npm run dev:backend

# Запуск только frontend  
npm run dev:frontend

# Форматирование кода
npm run format

# Проверка типов
npm run type-check

# Генерация Prisma Client
cd backend && npx prisma generate

# Создание новой миграции
cd backend && npx prisma migrate dev --name migration_name
```

## Стандарты кода

### TypeScript

- Используйте строгую типизацию
- Избегайте `any`
- Предпочитайте interfaces для объектов

### React

- Используйте функциональные компоненты
- Применяйте хуки для состояния
- Мемоизируйте тяжелые вычисления

### Backend

- Следуйте принципам NestJS
- Используйте DTO для валидации
- Документируйте API с помощью Swagger

## Вопросы?

Создайте issue в репозитории или свяжитесь с командой разработки.