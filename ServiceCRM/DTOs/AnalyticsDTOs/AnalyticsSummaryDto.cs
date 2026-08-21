using System.ComponentModel;

namespace ServiceCRM.DTOs.AnalyticsDTOs
{
    [Description("Сводка за период")]
    public class AnalyticsSummaryDto
    {
        [Description("Всего заявок")]
        public int TotalRequests { get; set; }

        [Description("Всего завершенных заявок")]
        public int CompletedCount { get; set; }

        [Description("Процент закрытия заявок")]
        public decimal ConversionRate { get; set; }

        [Description("Средний чек за заказ")]
        public decimal AverageCheck { get; set; }

        [Description("Общий оборот")]
        public decimal Revenue { get; set; }

        [Description("Расходы на запчасти")]
        public decimal DirectExpenses { get; set; }

        [Description("Выплаты мастерам")]
        public decimal MasterPayouts { get; set; }

        [Description("Затраты на рекламу")]
        public decimal AdExpenses { get; set; }

        [Description("Чистая прибыль владельца")]
        public decimal OwnerProfit { get; set; }
    }
}
