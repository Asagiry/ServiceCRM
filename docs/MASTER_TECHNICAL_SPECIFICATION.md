# 🏛️ ПОЛНОЕ ТЕХНИЧЕСКОЕ ЗАДАНИЕ: ServiceCRM (Backend .NET 10)

> **Статус проекта на 21 августа 2026:**
> Ядро системы (БД, Клиенты, Мастера, Заявки, Маркетинг, Аналитика с Dapper/Redis, CancellationToken, AsNoTracking) полностью разработано и скомпилировано без ошибок. 
> Ниже зафиксирован финальный скоуп работ до собеседования 26 августа.

---

## 📑 СОДЕРЖАНИЕ СИСТЕМЫ

1. [Блок 1: Архитектурные паттерны и чистый код](#1-блок-1-архитектурные-паттерны-и-чистый-код)
2. [Блок 2: База данных и производительность (PostgreSQL)](#2-блок-2-база-данных-и-производительность-postgresql)
3. [Блок 3: Безопасность и Сеть (JWT & CORS)](#3-блок-3-безопасность-и-сеть-jwt--cors)
4. [Блок 4: Интеграции (Telegram Bot & Webhook Звонков)](#4-блок-4-интеграции-telegram-bot--webhook-звонков)
5. [Блок 5: Тестовые данные (Seeder) и демонстрация](#5-блок-5-тестовые-данные-seeder-и-демонстрация)

---

## 1. Блок 1: Архитектурные паттерны и чистый код

### 1.1. Кастомные исключения (Exception-Driven Error Flow)
- **Цель:** Избавиться от ручных проверок `if (entity == null) return null;` в контроллерах и сервисах.
- **Классы:**
  - `NotFoundException : Exception` (возвращает HTTP `404 Not Found`).
  - `BadRequestException : Exception` (возвращает HTTP `400 Bad Request` при нарушении бизнес-правил, например: попытка назначить неактивного мастера).
- **Обновление `ExceptionMiddleware.cs`:**
  - Перехват `NotFoundException` $\rightarrow$ статус 404, тело `{ message: "..." }`.
  - Перехват `BadRequestException` $\rightarrow$ статус 400, тело `{ message: "..." }`.
  - Все остальные непредвиденные ошибки $\rightarrow$ статус 500.

### 1.2. Статический класс генерации ключей кэша `CacheKeys.cs`
- **Файл:** `Common/CacheKeys.cs`
- **Константы и методы:**
  - `public const string DashboardToday = "dashboard_today";`
  - `public static string DashboardSummary(DateTime? from, DateTime? to) => $"dashboard_summary_{from:yyyyMMdd}_{to:yyyyMMdd}";`
  - `public static string SourceAnalytics(DateTime? from, DateTime? to) => $"source_analytics_{from:yyyyMMdd}_{to:yyyyMMdd}";`

### 1.3. Response DTOs (Выходные модели данных)
- Перевести списковые и детальные ручки на возврат строгих DTO (`ClientResponseDto`, `MasterResponseDto`, `ServiceRequestResponseDto`), исключая циклы сериализации и передачу лишних внутренних полей.

---

## 2. Блок 2: База данных и производительность (PostgreSQL)

### 2.1. B-Tree Индексы во Fluent API (`AppDbContext.cs`)
- **Заявки (`ServiceRequests`)**:
  - Составной индекс: `new { r.Status, r.CreatedAt }` (ускоряет выборку для аналитики и фильтрации по статусам).
  - Индекс по дате выезда: `r.SheduledAt` (для календаря расписания).
  - Индексы по внешним ключам: `r.ClientId`, `r.MasterId`, `r.SourceId`.
- **Клиенты и Мастера**:
  - Индекс по номеру телефона: `Clients.PhoneNumber`, `Masters.PhoneNumber`.
- **Миграция:** `Add-Migration AddPerformanceIndexes` $\rightarrow$ `Update-Database`.

---

## 3. Блок 3: Безопасность и Сеть (JWT & CORS)

### 3.1. Аутентификация и Ролевая модель (JWT)
- **Пакет:** `Microsoft.AspNetCore.Authentication.JwtBearer`
- **Роли:**
  - `Admin` (Диспетчер/Владелец) — полный доступ ко всем модулям, аналитике, бюджетам.
  - `Master` (Выездной специалист) — доступ только к своим заявкам.
- **Сущность `User` (или логин мастера/админа)**:
  - `Id`, `Username`, `PasswordHash`, `Role`, `MasterId?`.
- **Контроллер `AuthController.cs` (`api/auth`)**:
  - `POST /api/auth/login` $\rightarrow$ валидация логина/пароля, возврат `accessToken` (с claims: `UserId`, `Role`, `Name`).
- **Защита эндпоинтов:** Атрибуты `[Authorize]`, `[Authorize(Roles = "Admin")]`.

### 3.2. Настройка CORS (`Program.cs`)
- Добавление политики `AllowAll` (или с разрешением домена фронтенда `localhost:3000`), чтобы браузер не блокировал запросы к API.

---

## 4. Блок 4: Интеграции (Telegram Bot & Webhook Звонков)

### 4.1. Webhook сервиса коллтрекинга («Телегудок»)
- **Контроллер:** `WebhooksController.cs` (`api/webhooks/call`)
- **Поведение:**
  1. Прием JSON/Form-data от Телегудка (номер клиента, сайт/источник, ссылка на запись звонка).
  2. Автопоиск клиента по `PhoneNumber`. Если нет $\rightarrow$ автосоздание нового `Client`.
  3. Автопоиск `LeadSource` по имени сайта.
  4. Автосоздание новой заявки со статусом `RequestStatus.New`.

### 4.2. Telegram-бот для мастеров (`Telegram.Bot`)
- **Архитектура:** `IHostedService` (фоновый сервис внутри .NET).
- **Сценарии:**
  1. **Назначение:** При переводе заявки в статус `Assigned` бот отправляет мастеру карточку заказа с кнопкой «Принять».
  2. **В работе:** Кнопка «Завершить заказ».
  3. **Микроопрос закрытия:** Бот запрашивает:
     - «Сумма с клиента (TotalPrice)»
     - «Расходы на запчасти (DirectExpenses)»
     После ответа бот сам вызывает `CompleteServiceRequestAsync` и закрывает сделку.

---

## 5. Блок 5: Тестовые данные (Seeder) и демонстрация

### 5.1. `DbSeederService.cs`
- Генерация 3 рекламных источников с расходами (`AdExpenses`).
- Генерация 3 мастеров разных специализаций.
- Генерация 15 клиентов.
- Генерация 50 реалистичных заявок с распределением за последние 30 дней (выручка, расходы, чистая прибыль).
- Эндпоинт `POST /api/dev/seed` для мгновенного наполнения перед показом на собеседовании.
