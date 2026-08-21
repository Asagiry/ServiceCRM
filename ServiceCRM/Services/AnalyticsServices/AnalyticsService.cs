using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using Npgsql;
using ServiceCRM.DTOs.AnalyticsDTOs;
using System.Text.Json;

namespace ServiceCRM.Services.AnalyticsServices
{
    public class AnalyticsService : IAnalyticsService
    {

        AppDbContext _context;
        IConfiguration _configuration;
        IDistributedCache _cache;
        string connectionName = "DefaultConnection";

        public AnalyticsService(AppDbContext context, IConfiguration configuration, IDistributedCache cache)
        {
            _context = context;
            _configuration = configuration;
            _cache = cache;
        }

        public async Task<DashboardTodayDto> GetDashboardTodayDtoAsync(
            CancellationToken ct = default)
        {
            string cacheKey = $"dashboard_{DateTime.UtcNow:yyyyMMdd}";
            string? cashedJson = await _cache.GetStringAsync(cacheKey);

            if (cashedJson != null)
            {
                return JsonSerializer.Deserialize<DashboardTodayDto>(cashedJson) ?? new DashboardTodayDto();
            }

            DashboardTodayDto dto = await _GetDashboardTodayDtoFromDapperAsync(ct);

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30)
            };
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(dto), options);

            return dto;
        }

        private async Task<DashboardTodayDto> _GetDashboardTodayDtoFromDapperAsync(
            CancellationToken ct = default)
        {
            DateTime todayStart = DateTime.UtcNow.Date;
            DateTime tomorrowStart = todayStart.AddDays(1);

            string connectionString = _configuration.GetConnectionString(connectionName) ?? "";

            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync(ct);

            var query =
                """
                SELECT 
                    COUNT(*) FILTER(WHERE "MasterId" IS NULL) AS "UnassignedTodayCount",
                    COUNT(*) FILTER(WHERE "SheduledAt" >= @todayStart AND "SheduledAt" < @tomorrowStart) AS "SheduledTodayCount",
                    COUNT(*) FILTER(WHERE "Status" in (1,2)) AS "InProgressNow",
                    COUNT(*) FILTER(WHERE "Status" = 3) AS "CompletedTodayCount",
                    COALESCE(SUM("TotalPrice") FILTER (WHERE "Status" = 3), 0) AS "RevenueToday",
                    COALESCE(SUM("DirectExpenses") FILTER (WHERE "Status" = 3), 0) AS "ExpensesToday",
                    0.0 AS "MasterPayoutsToday",
                    0.0 AS "OwnerProfitToday"
                FROM "ServiceRequests"
                WHERE ("CreatedAt" >= @todayStart AND "CreatedAt" < @tomorrowStart)
                   OR ("SheduledAt" >= @todayStart AND "SheduledAt" < @tomorrowStart);
                """;

            var command = new CommandDefinition(
                query,
                new {todayStart,tomorrowStart},
                cancellationToken: ct);

            var dto = await connection.QuerySingleAsync<DashboardTodayDto>(command);

            decimal netProfitBase = dto.RevenueToday - dto.ExpensesToday;
            dto.MasterPayoutsToday = netProfitBase > 0 ? netProfitBase * 0.50m : 0;
            dto.OwnerProfitToday = dto.RevenueToday - dto.ExpensesToday - dto.MasterPayoutsToday;

            return dto;
        }



        public async Task<AnalyticsSummaryDto> GetSummaryAsync(
            DateTime? fromDate, 
            DateTime? toDate,
            CancellationToken ct = default)
        {
            string cacheKey = $"dashboard_{fromDate:yyyyMMdd}_{toDate:yyyyMMdd}";
            string? cashedJson = await _cache.GetStringAsync(cacheKey);

            if(cashedJson != null)
            {
                return JsonSerializer.Deserialize<AnalyticsSummaryDto>(cashedJson) ?? new AnalyticsSummaryDto();
            }

            AnalyticsSummaryDto dto = await _GetSummaryDtoFromDapperAsync(fromDate, toDate, ct);

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(60)
            };
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(dto), options);

            return dto;

        }

        private async Task<AnalyticsSummaryDto> _GetSummaryDtoFromDapperAsync(
            DateTime? fromDate, 
            DateTime? toDate,
            CancellationToken ct = default)
        {
            fromDate = fromDate ?? DateTime.UtcNow.AddDays(-30);
            toDate = toDate ?? DateTime.UtcNow;

            string connectionString = _configuration.GetConnectionString(connectionName) ?? "";
            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync(ct);

            var sqlSummary = """
                SELECT 
                    COUNT(*) AS TotalRequests,
                    COUNT(*) FILTER (WHERE "Status" = 3) AS CompletedCount,
                    0.0 AS "ConversionRate",
                    0.0 AS "AverageCheck",
                    COALESCE(SUM("TotalPrice") FILTER (WHERE "Status" = 3), 0) AS Revenue,
                    COALESCE(SUM("DirectExpenses") FILTER (WHERE "Status" = 3), 0) AS DirectExpenses,
                    COALESCE(SUM("MasterPayout") FILTER (WHERE "Status" = 3), 0) AS MasterPayouts,
                    0.0 AS "AdExpenses",
                    0.0 AS "OwnerProfit"
                FROM "ServiceRequests"
                WHERE "CreatedAt" >= @fromDate AND "CreatedAt" <= @toDate;
                """;
            var sqlAdSpent = """
                SELECT COALESCE(SUM("Amount"), 0) 
                FROM "AdExpenses"
                WHERE "ExpenseStartDate" >= @fromDate AND "ExpenseStartDate" <= @toDate;
                """;

            var commandSummary = new CommandDefinition(
                sqlSummary,
                new { fromDate, toDate },
                cancellationToken: ct
                );

            var commandAdSpent = new CommandDefinition(
                sqlAdSpent,
                new { fromDate, toDate },
                cancellationToken: ct
                );

            var summary = await connection.QuerySingleAsync<AnalyticsSummaryDto>(commandSummary);
            var adSpent = await connection.QuerySingleAsync<decimal>(commandAdSpent);


            summary.ConversionRate = summary.TotalRequests > 0
                ? Math.Round((decimal)summary.CompletedCount / summary.TotalRequests * 100, 2)
                : 0;

            summary.AverageCheck = summary.CompletedCount > 0
                ? Math.Round((decimal)summary.Revenue / summary.CompletedCount * 100, 2)
                : 0;

            summary.AdExpenses = adSpent;

            summary.OwnerProfit = summary.Revenue - summary.DirectExpenses - summary.MasterPayouts - summary.AdExpenses;

            return summary;
        }

        public async Task<List<SourceAnalyticsDto>> GetSourceAnalyticsAsync(
            DateTime? fromDate,
            DateTime? toDate,
            CancellationToken ct = default)
        {
            string connectionString = _configuration.GetConnectionString(connectionName) ?? "";
            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync(ct);

            var parameters = new { FromDate = fromDate, ToDate = toDate };

            string leadSourcesSql = """
                SELECT "Id", "Name" 
                FROM "LeadSources";
                """;

            string totalRevenueSql = """
                SELECT
                    "SourceId",
                    COUNT(*) AS "RequestsCount",
                    COALESCE(SUM("TotalPrice"), 0) AS "TotalRevenue"
                FROM "ServiceRequests"
                WHERE (@FromDate IS NULL OR "CreatedAt" >= @FromDate)
                  AND (@ToDate IS NULL OR "CreatedAt" <= @ToDate)
                GROUP BY "SourceId";
                """;

            string totalSpentSql = """
                SELECT
                    "LeadSourceId",
                    COALESCE(SUM("Amount"), 0) AS "TotalSpent"
                FROM "AdExpenses"
                WHERE (@FromDate IS NULL OR "ExpenseStartDate" >= @FromDate)
                  AND (@ToDate IS NULL OR "ExpenseStartDate" <= @ToDate)
                GROUP BY "LeadSourceId";
                """;

            var leadSourcesCmd = new CommandDefinition(leadSourcesSql, cancellationToken: ct);
            var revenueCmd = new CommandDefinition(totalRevenueSql, parameters, cancellationToken: ct);
            var spentCmd = new CommandDefinition(totalSpentSql, parameters, cancellationToken: ct);

            var leadSources = (await connection.QueryAsync<(int Id, string Name)>(leadSourcesCmd)).ToList();
            var revenueData = (await connection.QueryAsync<(int SourceId, int RequestsCount, decimal TotalRevenue)>(revenueCmd)).ToList();
            var spentData = (await connection.QueryAsync<(int LeadSourceId, decimal TotalSpent)>(spentCmd)).ToList();

            var result = new List<SourceAnalyticsDto>();

            foreach (var source in leadSources)
            {
                var rev = revenueData.FirstOrDefault(r => r.SourceId == source.Id);
                var exp = spentData.FirstOrDefault(e => e.LeadSourceId == source.Id);

                int count = rev.RequestsCount;
                decimal revenue = rev.TotalRevenue;
                decimal spent = exp.TotalSpent;

                decimal roi = spent > 0
                    ? Math.Round(((revenue - spent) / spent) * 100, 2)
                    : 0;

                result.Add(new SourceAnalyticsDto
                {
                    SourceName = source.Name,
                    RequestsCount = count,
                    TotalRevenue = revenue,
                    TotalAdSpent = spent,
                    Roi = roi
                });
            }

            return result;
        }


    }
}
