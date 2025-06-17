# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

АСО (ASO) - интернет-магазин автозапчастей с расширенной функциональностью для B2B и B2C сегментов. Монорепозиторий использует npm workspaces с Next.js 15 (frontend) и NestJS 11 (backend). Пожалуйста перед тем, как начать что-то делать - обдумай и опиши план действий "Я собираюсь сделать:" и спроси разрешения действовать по плану или внести в него изменения.
Не пытайся сам запустить проект (npm run dev и npm run start:dev, если нужно проверить - попроси меня, я запущу и дам информацию), а так же не запускай миграции самостоятельно - проси это сделать меня.
Еще одно важное замечание - нам очень важно SEO, поэтому постарайся использовать серверные компоненты next 15, на сколько это возможно. Это касается только публичной части - панель управления можно делать клиентской. Соответственно для серверный запросов используй fetch из next 15, а для клиентских можно использовать axios / tan stack query.
Еще один важный момент - я не хочу использовать docker и контейнеризацию.

## Technology Stack

### Backend

- **Framework**: NestJS 11
- **Database**: PostgreSQL
- **ORM**: Prisma
- **API Documentation**: Swagger (автоматическая генерация)
- **Authentication**: SMS-based (номер телефона + код подтверждения)
- **CORS**: Разрешено все в режиме разработки

### Frontend

- **Framework**: Next.js 15 с App Router
- **UI**: React 19 + Tailwind CSS v4
- **State Management**: TBD
- **Build Tool**: Turbopack (dev mode)

## Essential Commands

### Development

```bash
# Запуск обоих приложений одновременно
npm run dev

# Запуск только backend
npm run dev:backend

# Запуск только frontend
npm run dev:frontend

# Миграции базы данных (из папки backend)
cd backend && npx prisma migrate dev

# Генерация Prisma Client
cd backend && npx prisma generate

# Prisma Studio для просмотра БД
cd backend && npx prisma studio
```

### Building & Production

```bash
# Сборка обоих приложений
npm run build

# Запуск production версии
npm run start
```

### Testing & Linting

```bash
# Backend
cd backend
npm run lint          # Проверка и исправление кода
npm run test          # Unit тесты
npm run test:e2e      # E2E тесты
npm run test:cov      # Тесты с покрытием

# Frontend
cd frontend
npm run lint          # Проверка кода Next.js
```

## Architecture & Business Logic

### Core Features

1. **Каталог товаров**

   - Иерархическая структура категорий
   - Фильтры и поиск
   - Характеристики/спецификации товаров
   - Связь товаров с марками/моделями/поколениями автомобилей

2. **Пользовательский функционал**

   - Анонимные пользователи с сохранением данных
   - Авторизация по SMS
   - Личный кабинет
   - Избранное
   - Корзина
   - История заказов

3. **Заказы**

   - Управляемые статусы (не enum, хранятся в БД)
   - Динамические методы доставки
   - Динамические методы оплаты
   - Отслеживание заказов

4. **Уникальные функции**
   - **Чат с экспертом**: менеджеры могут консультировать и отправлять товарные предложения
   - **Товарные предложения**: отдельная сущность, можно добавить в корзину как обычный товар
   - **Анонимные сессии**: привязываются к пользователю после авторизации, позволяют собрать данные с разных устройств

### Database Schema Considerations

- **Users**: Может быть анонимным или авторизованным
- **Sessions**: Связь анонимных сессий с пользователями
- **Products**: Товары с характеристиками и связями с автомобилями
- **ProductOffers**: Товарные предложения от менеджеров
- **Carts**: Поддержка анонимных корзин
- **Orders**: Гибкая система статусов
- **Chats**: История переписки с экспертами
- **Vehicles**: Марки, модели, поколения автомобилей

### API Design Principles

1. **RESTful endpoints** для CRUD операций
2. **WebSockets** для real-time чата
3. **Swagger documentation** для всех endpoints
4. **DTO validation** с class-validator
5. **Guards** для защиты роутов (анонимные vs авторизованные)
6. **DTO Requirements**: Все входные и выходные данные методов backend должны быть описаны в DTO классах с использованием декораторов class-validator и @ApiProperty для Swagger документации

## Development Workflow

1. **Ведение прогресса**: Обновляйте `progress.md` после каждой завершенной задачи
2. **Todo листы**: Используйте `progress.md` для планирования задач
3. **Миграции**: Создавайте миграции для любых изменений схемы БД
4. **API First**: Сначала проектируйте API, затем реализуйте frontend

## Security Considerations

- JWT токены для авторизованных пользователей
- JWT tokens для анонимных пользователей
- Rate limiting для SMS отправки
- Валидация всех входных данных
- Санитизация данных перед сохранением в БД

## Performance Optimization

- Пагинация для списков товаров
- Кеширование популярных запросов
- Оптимизация запросов Prisma (include, select)
- Lazy loading для изображений
- Изображения загружаем и отдаем с нашего сервера

## Anonymous Token System

### Backend Implementation

Система анонимных токенов позволяет отслеживать пользователей без регистрации:

- **AnonymousUser** - отдельная модель в БД с уникальным токеном
- **JWT токены** с сроком жизни 365 дней
- **Endpoints**:
  - `POST /auth/anonymous/token` - получить новый токен
  - `POST /auth/anonymous/validate` - проверить существующий токен
- **Слияние данных** при регистрации пользователя (корзина, избранное, чаты)
- Токен передается через заголовок `x-anonymous-token`

### Frontend Implementation

Реализована синхронизированная система работы с токенами:

1. **Route Handler** (`/api/auth/anonymous`):
   - Единая точка управления токенами
   - Автоматическая валидация и обновление
   - Хранение в httpOnly cookies

2. **Синхронизация хранилищ**:
   - Основное хранилище: httpOnly cookies (безопасность)
   - Дублирование в localStorage для клиентского доступа
   - Автоматическая синхронизация при загрузке

3. **Компоненты системы**:
   - `AnonymousTokenProvider` - синхронизирует токены при загрузке
   - `AnonymousTokenService` - для серверных компонентов (cookies)
   - `ClientAnonymousTokenService` - для клиентских компонентов (localStorage)
   - `useAnonymousToken()` hook - для React компонентов
   - Middleware - автоматически добавляет токены в заголовки

4. **Автоматическое управление**:
   - Проверка токена при каждой загрузке страницы
   - Валидация существующего токена через backend API
   - Автоматическое получение нового токена при необходимости
   - Срок жизни токена: 365 дней

5. **Использование**:
   - В серверных компонентах: `await AnonymousTokenService.ensureToken()`
   - В клиентских компонентах: `useAnonymousToken()` hook или `ClientAnonymousTokenService`
   - API запросы: токен автоматически добавляется через middleware
   - Клиентские API запросы: используйте `apiRequestWithAuth()` из `lib/api/client-with-auth.ts`

## Memories

- пожалуйста не забывай обновлять файл progress.md
- Мы используем новый подход prisma 6.9 для генерации клиента, теперь клиент призмы мы импортируем не из @prisma/client а из generated/prisma.