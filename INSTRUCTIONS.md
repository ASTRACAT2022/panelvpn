# Руководство по запуску Sing-box Panel (PanelVPN)

Поскольку автоматическая установка зависимостей не удалась из-за ограничений среды, выполните следующие шаги вручную для запуска проекта.

## 1. Установка зависимостей

В корне проекта выполните:

```bash
# Установка Node.js зависимостей (Backend и Frontend)
npm install

# Генерация клиента Prisma (после установки зависимостей)
cd apps/api && npx prisma generate
```

## 2. Запуск инфраструктуры

Убедитесь, что Docker запущен, и выполните:

```bash
# Запуск PostgreSQL и Redis
docker-compose up -d
```

## 3. Настройка переменных окружения

Убедитесь, что файл `.env` в `apps/api` настроен корректно (он был создан автоматически):
- `DATABASE_URL` должен указывать на ваш PostgreSQL (для локального VPS предпочтительно `127.0.0.1:5432`).

## 4. Запуск приложений

### Backend (API)
```bash
# В терминале 1
cd apps/api
npm run start:dev
```
API будет доступно по адресу: http://localhost:3001

### Frontend (Web Panel)
```bash
# В терминале 2
cd apps/web
npm run dev
```
Панель будет доступна по адресу: http://localhost:3000

### Node Agent (Go)
Для запуска агента требуется Go 1.21+:
```bash
# В терминале 3
cd apps/agent
go mod tidy
go run main.go
```

## 5. Структура проекта

- **apps/web**: Next.js 15 Dashboard (App Router, Tailwind, Shadcn UI).
  - `app/(dashboard)`: Основной интерфейс панели.
  - `components/layout`: Сайдбар и лейаут.
- **apps/api**: NestJS Backend.
  - `src/users`: Модуль пользователей.
  - `prisma/schema.prisma`: Схема базы данных.
- **apps/agent**: Go агент для Sing-box.
  - Поддерживает mTLS и Heartbeat.
