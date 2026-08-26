using System.ComponentModel;

namespace ServiceCRM.DTOs.AnalyticsDTOs
{
    [Description("Эффективность источников")]
    public class SourceAnalyticsDto
    {
        [Description("Название источника")]
        public required string SourceName { get; set; }

        [Description("Количество заявок")]
        public int RequestsCount { get; set; }

        [Description("Общая выручка")]
        public decimal TotalRevenue { get; set; }

        [Description("Сколько потрачено на рекламу")]
        public decimal TotalAdSpent { get; set; }

        [Description("Окупаемость в %")]
        public decimal Roi { get; set; }
    }
}
