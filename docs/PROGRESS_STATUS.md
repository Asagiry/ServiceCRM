# Статус подготовки ServiceCRM (собес 26 августа)

> Файл для восстановления контекста. Обновлён: вечер 24 августа.
> Полные ТЗ блоков — в TZ_BACKEND_FIXES.md рядом. Контракт API — в API.md рядом.

## СОБЕС: IT Co «Айтико» (Ярославль) — СР 26.08 в 14:30, онлайн ЯндексТелемост
- Проводит техдиректор. Ссылка сохранена. Камера НЕ нужна, демо экрана — НУЖНО (задача с функцией).
- Формат: 1) презентация компании + знакомство; 2) теория: **БД, ООП, языки, git**; 3) две задачи: **логическая** + **алгоритм на C#** с шарингом экрана.
- **Вывод:** спрашивают НЕ глубину ASP.NET, а базу + решение задач вслух. Проект — источник примеров для ООП: наследование → `Exceptions/AppException` (StatusCode в базе), полиморфизм → сервисы за интерфейсами + middleware ловит базовый тип, инкапсуляция → DTO + FSM переходов в сервисе, абстракция → DbContext над PostgreSQL, extension-методы в Extensions/.
- Ежедневно: 2–3 задачки на C# вслух, логические головоломки, SQL (JOIN/GROUP BY/индексы/ACID), git (merge vs rebase, конфликты).

## ГДЕ ОСТАНОВИЛИСЬ (вечер 24.08): ВСЕ ОБЯЗАТЕЛЬНЫЕ БЛОКИ ЗАКРЫТЫ

**25.08 — выходной (ДР!), ничего не планируется.**

### Готово и проверено живыми тестами:
- **Блоки 0–1**: user-secrets (`Jwt:Key`, `Admin:Username`, `Admin:Password`), docker-compose, сквош InitialCreate, CacheKeys, ResolveRange, DELETE→204
- **Блок 2**: Response-DTO на всё + пагинация PagedResult (кламп 1..100), платежи (POST/GET `api/requests/{id}/payments`, один платёж = закрытая заявка), аналитика с Redis-кэшем
- **Блок 4**: JWT админ-only (`[Authorize(Roles = Roles.Admin)]` везде кроме login), BCrypt, сид админа при старте, CORS "Frontend" (:3000/:5173), JsonStringEnumConverter + WhenWritingNull, OnChallenge/OnForbidden с JSON-телом, неверный пароль → 401 (UnauthorizedException). Мастера доступа к CRM не имеют — продуктовое решение (обоснование заготовлено: claims несут роль, дверь открыта)
- **Блок 3**: FSM в ServiceRequestService: AllowedTransitions = New→[InProgress, Cancelled], InProgress→[Completed, Cancelled]; терминальные без ключей. PATCH `/{id}/status` тело `{"status": "..."}`; complete ТОЛЬКО из InProgress (из New → 409); ConflictException → 409 через общий AppException.StatusCode; отмена оплаченной невозможна структурно (Completed терминальный — guard недостижим по дизайну)
- **Program.cs**: рефакторинг в Extensions/ (SwaggerServiceExtensions, AuthServicesExtensions, AppServicesExtensions, CorsServiceExtensions, PipelineExtensions c UseAppPipeline+SeedAdmin). Program.cs = 26 строк оглавления
- **Swagger**: Swashbuckle 10.2.3 + Microsoft.OpenApi 2.7.5, кнопка Authorize работает (рецепт v10: `AddSecurityRequirement(document => ... new OpenApiSecuritySchemeReference("Bearer", document))`); встроенный MapOpenApi удалён за ненадобностью
- **docs/API.md**: полный контракт для фронта — 29 эндпоинтов, оба формата ошибок, FSM-правила, справочники DTO и enum'ов, сценарий из 7 шагов

### Передача фронту (когда пользователь готов):
Новая ЧИСТАЯ сессия ИИ + вступление: «Ты фронтенд-разработчик, прочитай C:\Users\VibeCode\CRM\docs\API.md целиком. React+TS+Vite на :3000, бэкенд уже на :5041 (CORS открыт). Запуск бэка: docker → dotnet run --project ServiceCRM из C:\Users\VibeCode\CRM\backend; креды админа: dotnet user-secrets list --project ServiceCRM. Начни с экрана логина и списка заявок».

## ПЛАН ДО СОБЕСА (минимальный)
| Когда | Что |
|---|---|
| 25 | выходной — ДР |
| 26 утро | ТОЛЬКО повторение теории вслух + репетиция демо (логин→заявка→InProgress→complete→оплата→дашборд). Никакого нового кода |
| опционально | Индексы/инвалидация кэша/сидер — разговорные ответы вместо кода (шпаргалку пообещал тимлид); фронт от ИИ — бонус, не критичный путь |

## КЛЮЧЕВЫЕ РЕШЕНИЯ (уметь обосновать)
- Один платёж закрывает заявку; маппинг руками без AutoMapper; page/pageSize дефолты в контроллере + кламп в ToPagedListAsync; сортировка ОБЯЗАТЕЛЬНО до Skip/Take; миграции теперь ТОЛЬКО аддитивные (в базе данные!); user-secrets dev / env prod; Dapper для аналитики / EF Core для CRUD; Redis TTL 30с/60с/120с через CacheKeys
- Админ-only авторизация: диспетчеры ведут CRM, мастера получают вызовы офлайн
- FSM одним словарём в сервисе: правила бизнеса в домене; новый статус = одна строка словаря
- AppException.StatusCode: middleware читает статус из исключения — без плодания catch-веток
- Extension-методы для конфигурации — тот же паттерн, что внутри самого фреймворка
- Уроки живьём: route-value должно совпадать с именем параметра действия (CreatedAtAction «No route matches» ПОСЛЕ SaveChanges = данные записаны, клиенту 500); JsonStringEnumConverter отсекает мусорные enum'ы на десериализации (формат ProblemDetails, не наш)

## ХВОСТЫ (все некритичные)
- Middleware первый catch: пробел «ошибка :{Message}» — косметика
- PaymentService: платёж по незакрытой заявке даёт невнятное «превышает стоимость (0 ₽)» вместо явного guard'а «стоимость ещё не выставлена»
- Статус Assigned существует в enum, но недостижим (нет в матрице) — задокументировано в API.md, фронт предупреждён
- README — после собеса

## Инфраструктура
- docker: ServiceCRM-postgres (user postgres), ServiceCRM-redis
- Порт приложения: http://localhost:5041 · Swagger: /swagger (Authorize кнопка)
- Запуск для тестов: из папки backend → `dotnet run --project ServiceCRM --launch-profile http`
- Тест-цепочка живьём: логин → клиент → заявку → PATCH InProgress → complete → оплата → дашборд ≠ 0
