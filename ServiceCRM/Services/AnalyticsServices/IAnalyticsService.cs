using ServiceCRM.DTOs.AnalyticsDTOs;

namespace ServiceCRM.Services.AnalyticsServices
{
    public interface IAnalyticsService
    {
        public Task<DashboardTodayDto> GetDashboardTodayDtoAsync();

        public Task<AnalyticsSummaryDto> GetSummaryAsync(DateTime? fromDate, DateTime? toDate);

        public Task<List<SourceAnalyticsDto>> GetSourceAnalyticsAsync(DateTime? fromDate, DateTime? toDate);
    }
}
