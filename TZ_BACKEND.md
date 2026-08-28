# Техническое задание (ТЗ) для бэкенда: Аналитика и закрытие заявок

## 📌 Обзор
Для расширения аналитики в CRM (построение графиков динамики по дням, лидерборда мастеров и корректной юнит-экономики) необходимо реализовать 2 новых эндпоинта и дополнить 2 существующих метода.

---

## 🚀 Задача 1. Динамика по дням (График выручки и прибыли)

### Назначение:
Эндпоинт отдаёт агрегированные данные по каждому дню за выбранный интервал дат. Фронтенд строит по ним интерактивный график выручки, расходов и количества заявок.

- **URL**: `GET /api/analytics/dynamics`
- **Авторизация**: `[Authorize(Roles = Roles.Admin)]`
- **Query-параметры**:
  - `fromDate` (`DateTime?`, по умолчанию: `DateTime.UtcNow.AddDays(-30)`)
  - `toDate` (`DateTime?`, по умолчанию: `DateTime.UtcNow`)

### C# DTO:
Создать файл `backend/ServiceCRM/DTOs/AnalyticsDTOs/AnalyticsDayPointDto.cs`:

```csharp
using System.ComponentModel;

namespace ServiceCRM.DTOs.AnalyticsDTOs
{
    [Description("Точка графика аналитики за один день")]
    public class AnalyticsDayPointDto
    {
        [Description("Дата в формате YYYY-MM-DD")]
        public required string Date { get; set; }

        [Description("Выручка за этот день, руб")]
        public decimal Revenue { get; set; }

        [Description("Расходы за этот день (запчасти + выплаты + реклама), руб")]
        public decimal TotalExpenses { get; set; }

        [Description("Чистая прибыль владельца за этот день, руб")]
        public decimal OwnerProfit { get; set; }

        [Description("Количество созданных заявок в этот день")]
        public int RequestsCount { get; set; }

        [Description("Количество завершенных ремонтов в этот день")]
        public int CompletedCount { get; set; }
    }
}
```

### Бизнес-логика (в `AnalyticsService`):
1. Сгенерировать список всех календарных дней от `fromDate.Date` до `toDate.Date` (чтобы дни с 0 продаж имели `Revenue = 0`, а не пропадали из графика).
2. Для каждого дня сгруппировать:
   - Заявки, созданные в этот день -> `RequestsCount`.
   - Заявки со статусом `Completed`, закрытые в этот день:
     - `Revenue` = сумма `TotalPrice`
     - `DirectExpenses` = сумма `DirectExpenses`
     - `MasterPayouts` = сумма `MasterPayout`
   - Расходы на рекламу (`AdExpenses`) за этот день -> `AdSpent`.
   - `TotalExpenses` = `DirectExpenses` + `MasterPayouts` + `AdSpent`.
   - `OwnerProfit` = `Revenue` - `TotalExpenses`.

### Пример JSON ответа (`200 OK`):
```json
[
  {
    "date": "2026-08-20",
    "revenue": 25000.00,
    "totalExpenses": 14500.00,
    "ownerProfit": 10500.00,
    "requestsCount": 4,
    "completedCount": 3
  },
  {
    "date": "2026-08-21",
    "revenue": 38000.00,
    "totalExpenses": 19000.00,
    "ownerProfit": 19000.00,
    "requestsCount": 7,
    "completedCount": 5
  }
]
```

---

## 🏆 Задача 2. Рейтинг и эффективность мастеров

### Назначение:
Эндпоинт отдаёт сравнительную статистику по всем мастерам за выбранный период для вывода лидерборда и аналитики выплат.

- **URL**: `GET /api/analytics/masters`
- **Авторизация**: `[Authorize(Roles = Roles.Admin)]`
- **Query-параметры**:
  - `fromDate` (`DateTime?`, по умолчанию: `DateTime.UtcNow.AddDays(-30)`)
  - `toDate` (`DateTime?`, по умолчанию: `DateTime.UtcNow`)

### C# DTO:
Создать файл `backend/ServiceCRM/DTOs/AnalyticsDTOs/MasterAnalyticsDto.cs`:

```csharp
using System.ComponentModel;

namespace ServiceCRM.DTOs.AnalyticsDTOs
{
    [Description("Аналитика эффективности мастера")]
    public class MasterAnalyticsDto
    {
        public int MasterId { get; set; }
        public required string MasterFullName { get; set; }
        public string? City { get; set; }
        public decimal CommissionPercent { get; set; }

        [Description("Всего заявок назначено за период")]
        public int AssignedCount { get; set; }

        [Description("Успешно завершено ремонтов")]
        public int CompletedCount { get; set; }

        [Description("Суммарная выручка, принесенная мастером, руб")]
        public decimal TotalRevenue { get; set; }

        [Description("Суммарно начислено выплат мастеру, руб")]
        public decimal TotalPayout { get; set; }

        [Description("Средний чек по заказам мастера, руб")]
        public decimal AverageCheck { get; set; }

        [Description("Конверсия закрытия заявок, %")]
        public decimal ConversionRate { get; set; }
    }
}
```

### Бизнес-логика:
- Выбрать всех мастеров из БД (`_context.Masters`), у которых есть заявки за интервал дат.
- По каждому мастеру посчитать:
  - `AssignedCount` = количество заявок мастера за период;
  - `CompletedCount` = количество заявок мастера со статусом `Completed`;
  - `TotalRevenue` = сумма `TotalPrice` по завершенным заявкам;
  - `TotalPayout` = сумма `MasterPayout` по завершенным заявкам;
  - `AverageCheck` = `CompletedCount > 0 ? TotalRevenue / CompletedCount : 0`;
  - `ConversionRate` = `AssignedCount > 0 ? (CompletedCount * 100m) / AssignedCount : 0`.

### Пример JSON ответа (`200 OK`):
```json
[
  {
    "masterId": 1,
    "masterFullName": "Иванов Иван Иванович",
    "city": "Москва",
    "commissionPercent": 30.0,
    "assignedCount": 12,
    "completedCount": 10,
    "totalRevenue": 85000.00,
    "totalPayout": 21000.00,
    "averageCheck": 8500.00,
    "conversionRate": 83.3
  }
]
```

---

## 📊 Задача 3. Дополнение `AnalyticsSummaryDto` метриками юнит-экономики

### Назначение:
Централизованный расчёт бизнес-метрик на бэкенде с гарантированной защитой от деления на 0.

### 1. Изменения в `backend/ServiceCRM/DTOs/AnalyticsDTOs/AnalyticsSummaryDto.cs`:

Добавить 4 новых поля:
```csharp
[Description("Стоимость привлечения заявки (CPA), руб")]
public decimal CostPerLead { get; set; }

[Description("Средняя прибыль с одного выполненного заказа, руб")]
public decimal ProfitPerJob { get; set; }

[Description("Маржинальность бизнеса (доля прибыли в выручке), %")]
public decimal GrossMarginPercent { get; set; }

[Description("Доля рекламных расходов в выручке (ДРР), %")]
public decimal MarketingExpenseRatio { get; set; }
```

### 2. Формулы в `AnalyticsService.GetSummaryAsync`:
```csharp
// Защита от деления на 0:
summary.CostPerLead = summary.TotalRequests > 0 
    ? Math.Round(summary.AdExpenses / summary.TotalRequests, 2) 
    : 0;

summary.ProfitPerJob = summary.CompletedCount > 0 
    ? Math.Round(summary.OwnerProfit / summary.CompletedCount, 2) 
    : 0;

summary.GrossMarginPercent = summary.Revenue > 0 
    ? Math.Round((summary.OwnerProfit / summary.Revenue) * 100m, 1) 
    : 0;

summary.MarketingExpenseRatio = summary.Revenue > 0 
    ? Math.Round((summary.AdExpenses / summary.Revenue) * 100m, 1) 
    : 0;
```

---

## ⚙ Задача 4. Nullable выплата мастера в `CompleteServiceRequestDto`

### Назначение:
Позволяет клиенту не считать выплату мастеру вручную. Если передано `null`, бэкенд вычисляет выплату автоматически по формуле: `Маржа * (Ставка мастера / 100)`.

### 1. В `backend/ServiceCRM/DTOs/ServiceRequestDTOs/CompleteServiceRequestDto.cs`:
```csharp
public class CompleteServiceRequestDto
{
    public decimal TotalPrice { get; set; }
    public decimal DirectExpenses { get; set; }

    // Сделать nullable (decimal?):
    public decimal? MasterPayout { get; set; }
}
```

### 2. В `backend/ServiceCRM/Services/ServiceRequestServices/ServiceRequestService.cs`:
В методе `CompleteServiceRequestAsync` добавить `.Include(x => x.Master)`:

```csharp
public async Task<ServiceRequestResponseDto> CompleteServiceRequestAsync(
    int id, 
    CompleteServiceRequestDto dto,
    CancellationToken ct = default)
{
    ServiceRequest serviceRequest = await _context.ServiceRequests
        .Include(x => x.Master) // <-- ВАЖНО: подгрузить мастера
        .Include(x => x.Client)
        .Include(x => x.LeadSource)
        .FirstOrDefaultAsync(x => x.Id == id, ct)
        ?? throw new NotFoundException(ErrorMessages.ServiceRequestNotFound(id));

    EnsureTransitionAllowed(serviceRequest.Status, RequestStatus.Completed);

    serviceRequest.CompleteServiceRequest(dto);

    await _context.SaveChangesAsync(ct);
    return serviceRequest.ToDto();
}
```

### 3. В `backend/ServiceCRM/Models/Request/ServiceRequest.cs`:
```csharp
public void CompleteServiceRequest(CompleteServiceRequestDto dto)
{
    Status = RequestStatus.Completed;
    TotalPrice = dto.TotalPrice;
    DirectExpenses = dto.DirectExpenses;

    if (dto.MasterPayout.HasValue)
    {
        MasterPayout = dto.MasterPayout.Value;
    }
    else
    {
        var margin = Math.Max(0, TotalPrice - DirectExpenses);
        var percent = Master?.CommissionPercent ?? 0;
        MasterPayout = Math.Round(margin * (percent / 100m), 2);
    }
}
```
