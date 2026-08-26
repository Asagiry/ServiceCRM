# ServiceCRM API — контракт для фронтенда

Версия: 1.0 · Обновлён: 2026-08-24

Базовый URL: `http://localhost:5041`

Интерактивная песочница: `http://localhost:5041/swagger` (кнопка Authorize — вставить токен).

---

## 1. Аутентификация

Все эндпоинты, кроме логина, требуют заголовок:

```
Authorization: Bearer <token>
```

### POST /api/auth/login

```json
{ "username": "admin", "password": "AdminPassword2026!" }
```

Ответ 200:

```json
{
  "token": "eyJ...",
  "expiresAt": "2026-08-24T20:30:00Z",
  "role": "admin",
  "username": "Voimax"
}
```

Ошибки: `400` — тело не прошло валидацию (username 6–20 симв., password 10–20 симв.);
`401` — неверные учётные данные.

Токен живёт 8 часов (`expiresAt`). Роль у всех пользователей — `admin`.

---

## 2. Конвенции

- **Enum'ы — строками**: `"New"`, `"Cash"` и т.д. Числа не принимаются и не отдаются.
- **null-поля отсутствуют** в ответах (не `"masterId": null`, а просто нет поля).
- **Даты** — ISO 8601 UTC: `2026-08-24T12:00:00Z`.
- **Пагинация**: списки обёрнуты в конверт

```json
{ "items": [...], "page": 1, "pageSize": 20, "totalCount": 57 }
```
Параметры `page` (с 1) и `pageSize` (1–100, дефолт 20) есть у всех списочных GET.

### Форматы ошибок

**Формат А** — бизнес-ошибки (большинство случаев):

```json
{ "statusCode": 409, "message": "Недопустимый переход статуса из 'New' в 'Completed'." }
```
Коды: `400` некорректные данные/нарушено бизнес-правило · `401` нет/просрочен токен ·
`403` нет прав · `404` не найдено · `409` конфликт с текущим состоянием.

**Формат Б** — ошибки валидации тела (FluentValidation), стандартный ASP.NET:

```json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": { "PhoneNumber": ["Номер телефона должен начинаться с +7"] }
}
```
Фронтенду: показывайте `errors.<поле>[0]`; из формата А — `message`. Неизвестное значение
enum в теле тоже даёт формат Б со статусом 400.

---

## 3. Бизнес-правила (важно прочитать до кода)

### Жизненный цикл заявки (машина состояний)

```
New ──→ Assigned ──→ InProgress ──→ Completed
 │          │            │
 └──────────┴────────────┴────────→ Cancelled
```

- Меняется только через `PATCH /api/requests/{id}/status`.
- Допустимые переходы:
  - `New` → `Assigned`, `InProgress`, `Cancelled`
  - `Assigned` → `InProgress`, `Cancelled`
  - `InProgress` → `Completed`, `Cancelled`
- **Нельзя** перескочить в `Completed` напрямую из `New` или `Assigned` (409).
- `Completed` и `Cancelled` — терминальные: любые попытки смены статуса → 409.
- Закрытие заявки с ценами — отдельный эндпоинт `PUT /complete`, допустим **только**
  из InProgress (иначе 409). Повторное закрытие → 409.

### Платежи

- Один платёж закрывает заявку полностью: второй POST на ту же заявку → 409 «Заявка уже закрыта».
- Сумма платежа ≤ totalPrice заявки.
- Отменить заявку с оплатой нельзя (409).
- Платёж по отменённой заявке запрещён (400).

---

## 4. Эндпоинты

### Клиенты `/api/clients`

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/clients?search=&page=&pageSize=` | Список, поиск по имени/телефону |
| GET | `/api/clients/{id}` | Карточка с вложенными `requests[]` |
| POST | `/api/clients` | Создать → 201 |
| PUT | `/api/clients/{id}` | Обновить |
| DELETE | `/api/clients/{id}` | Удалить → 204 |

Тело create/update:

```json
{ "fullName": "Иванов Иван", "phoneNumber": "+79001234567", "city": "Москва" }
```
Правила: имя 10–100, телефон строго `+7` + 10 цифр, город 2–25.

### Мастера `/api/masters`

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/masters?isActive=&search=&page=&pageSize=` | Список |
| GET | `/api/masters/{id}` | Карточка с заявками |
| POST | `/api/masters` | Создать → 201 |
| PUT | `/api/masters/{id}` | Обновить |
| DELETE | `/api/masters/{id}` | Удалить → 204 |

Тело:

```json
{
  "fullname": "Петров Пётр",
  "phoneNumber": "+79001234568",
  "telegram": "@petrov",
  "city": "Сочи",
  "specialization": ["TV", "Phone"],
  "commissionPercent": 10,
  "isActive": true
}
```
Правила: telegram начинается с `@`, specialization — непустой массив строк,
commissionPercent 0–100.

### Заявки `/api/requests`

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/requests?status=&masterId=&dateTime=&page=&pageSize=` | Список; `dateTime` — конкретный день создания (YYYY-MM-DD) |
| GET | `/api/requests/{id}` | Одна заявка |
| POST | `/api/requests` | Создать → 201, статус New |
| PUT | `/api/requests/{id}` | Полное обновление (включая masterId) |
| PATCH | `/api/requests/{id}/status` | Смена статуса (см. правила выше) |
| PUT | `/api/requests/{id}/complete` | Закрыть с финансами (только из InProgress) |
| DELETE | `/api/requests/{id}` | Удалить → 204 |
| GET | `/api/requests/{requestId}/payments` | Платёж заявки (один на заявку) |
| POST | `/api/requests/{requestId}/payments` | Внести оплату → 201 |

Создание:

```json
{
  "clientId": 1,
  "city": "Сочи",
  "address": "ул. Ленина, 10",
  "leadSourceId": 1,
  "problemDescription": "Не включается",
  "equipmentType": "TV",
  "scheduledAt": "2026-08-25T10:00:00Z"
}
```
`scheduledAt` необязателен. Длина: city 2–25, address 5–100, problemDescription ≤500,
equipmentType ≤25.

Смена статуса: `PATCH .../status`, тело `{ "status": "InProgress" }`.

Закрытие:

```json
{ "totalPrice": 5000, "directExpenses": 300, "masterPayout": 1500 }
```
Диапазон цен: 0–1 000 000.

Оплата:

```json
{ "amount": 5000, "paymentMethod": "Cash" }
```
`paymentDate` можно не передавать — сервер поставит текущее время.
Методы: `"Cash"`, `"Online"`, `"Terminal"`.

### Источники лидов `/api/lead-sources`

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/lead-sources?page=&pageSize=` | Список (с вложенными adExpenses) |
| GET | `/api/lead-sources/{id}` | Один |
| POST | `/api/lead-sources` | Создать → 201 |
| PUT | `/api/lead-sources/{id}` | Обновить |
| DELETE | `/api/lead-sources/{id}` | Удалить → 204 |
| POST | `/api/lead-sources/{id}/expenses` | Добавить рекламный расход |
| DELETE | `/api/lead-sources/expenses/{expenseId}` | Удалить расход → 204 |

Источник: `{ "name": "Авито", "websiteUrl": "https://avito.ru", "targetWeeklyBudget": 5000 }`.
Расход: `{ "amount": 1500, "expenseStartDate": "2026-08-01T00:00:00Z" }`.

### Аналитика `/api/analytics`

| Метод | Путь | Параметры |
|---|---|---|
| GET | `/api/analytics/dashboard/today` | — |
| GET | `/api/analytics/summary?fromDate=&toDate=` | Дефолты: последние 30 дней |
| GET | `/api/analytics/sources?fromDate=&toDate=` | ROI по источникам |

Ответы — плоские JSON-объекты (см. справочник ниже). Ответы кэшируются на сервере ~5 минут.

---

## 5. Ключевые DTO ответов

**ServiceRequestResponseDto** (главный объект системы):

```json
{
  "id": 1,
  "city": "Сочи",
  "address": "ул. Ленина, 10",
  "equipmentType": "TV",
  "problemDescription": "Не включается",
  "scheduledAt": null,
  "status": "Completed",
  "totalPrice": 5000,
  "directExpenses": 300,
  "masterPayout": 1500,
  "clientId": 1,
  "clientFullName": "Иванов Иван",
  "clientPhoneNumber": "+79001234567",
  "masterId": 2,
  "masterFullName": "Петров Пётр",
  "leadSourceId": 1,
  "leadSourceName": "Авито",
  "createdAt": "2026-08-20T09:00:00Z"
}
```
Если мастер не назначен — полей `masterId`/`masterFullName` просто нет.

**ClientResponseDto**: `{ id, fullName, phoneNumber, city, createdAt }`.
**MasterResponseDto**: `{ id, fullname, phoneNumber, telegram, city, specialization[], commissionPercent, isActive }`.
Детализированные версии клиентов и мастеров добавляют `requests[]`.

**PaymentResponseDto**: `{ id, serviceRequestId, amount, paymentDate, paymentMethod }`.

**LeadSourceResponseDto**: `{ id, name, websiteUrl, targetWeeklyBudget, isActive, createdAt, adExpenses[] }`,
расход: `{ id, amount, expenseStartDate, leadSourceId, leadSourceName }`.

**DashboardTodayDto**: `unassignedTodayCount, scheduledTodayCount, inProgressNow, completedTodayCount, revenueToday, expensesToday, masterPayoutsToday, ownerProfitToday`.

**AnalyticsSummaryDto**: `totalRequests, completedCount, conversionRate, averageCheck, revenue, directExpenses, masterPayouts, adExpenses, ownerProfit`.

**SourceAnalyticsDto**: `sourceName, requestsCount, totalRevenue, totalAdSpent, roi`.

---

## 6. Enum'ы

**RequestStatus**: `New` · `Assigned` *(не используйте)* · `InProgress` · `Completed` · `Cancelled`
**PaymentMethod**: `Cash` · `Online` · `Terminal`

---

## 7. Типовой сценарий фронтенда

1. `POST /api/auth/login` → сохранить token.
2. `GET /api/analytics/dashboard/today` → дашборд.
3. `POST /api/clients` → клиент; `POST /api/requests` → заявка (статус New).
4. `PUT /api/requests/{id}` с `masterId` → назначить мастера.
5. `PATCH /api/requests/{id}/status` `{"status":"InProgress"}` → работа началась.
6. `PUT /api/requests/{id}/complete` с ценами → заявка закрыта.
7. `POST /api/requests/{id}/payments` → оплата получена.
