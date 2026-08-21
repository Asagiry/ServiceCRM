using Microsoft.AspNetCore.Mvc;
using ServiceCRM.DTOs.AnalyticsDTOs;
using ServiceCRM.Services.AnalyticsServices;
using System.ComponentModel;

namespace ServiceCRM.Controllers.Analytics
{
    [ApiController]
    [Route("api/analytics")]
    public class AnalyticsController : ControllerBase
    {

        IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("dashboard/today")]
        [EndpointSummary("Получить сводку за сегодня в формате {DashboardTodayDto}")]
        public async Task<ActionResult<DashboardTodayDto>> GetDashboardToday(
            CancellationToken ct)
        {
            return Ok(await _analyticsService.GetDashboardTodayDtoAsync(ct));
        }

        [HttpGet("summary")]
        [EndpointSummary("Сводка за переданный период в формате {AnalyticsSummaryDto}")]
        public async Task<ActionResult<AnalyticsSummaryDto>> GetSummaryAsync(
            [FromQuery][Description("Начиная с этой даты(если не передано -30 days)")] DateTime? fromDate,
            [FromQuery][Description("Заканчивая этой датой(если не передано Utcnow)")] DateTime? toDate,
            CancellationToken ct)
        {
            return Ok(await _analyticsService.GetSummaryAsync(fromDate, toDate, ct));
        }

        [HttpGet("sources")]
        [EndpointSummary("Сводка по источникам за переданный период в формате {SourceAnalyticsDto}")]
        public async Task<ActionResult<List<SourceAnalyticsDto>>> GetSourceAnalytics(
            [FromQuery][Description("Начиная с этой даты(если не передано -30 days)")]DateTime? fromDate, 
            [FromQuery][Description("Заканчивая этой датой(если не передано Utcnow)")]DateTime? toDate,
            CancellationToken ct)
        {
            return Ok(await _analyticsService.GetSourceAnalyticsAsync(fromDate, toDate, ct));
        }





    }
}
