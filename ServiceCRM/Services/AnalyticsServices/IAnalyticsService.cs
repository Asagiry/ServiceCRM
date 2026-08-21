using ServiceCRM.DTOs.AnalyticsDTOs;

namespace ServiceCRM.Services.AnalyticsServices
{
    public interface IAnalyticsService
    {
        public Task<DashboardTodayDto> GetDashboardTodayDtoAsync(
            CancellationToken ct = default);

        public Task<AnalyticsSummaryDto> GetSummaryAsync(
            DateTime? fromDate,
            DateTime? toDate,
            CancellationToken ct = default);

        public Task<List<SourceAnalyticsDto>> GetSourceAnalyticsAsync(
            DateTime? fromDate,
            DateTime? toDate,
            CancellationToken ct = default);
    }
}
