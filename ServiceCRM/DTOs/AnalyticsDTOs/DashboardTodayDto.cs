using System.ComponentModel;


namespace ServiceCRM.DTOs.AnalyticsDTOs
{
    public class DashboardTodayDto
    {
        [Description("Количество заявок требующих назначения мастера")]
        public int UnassignedTodayCount { get; set; }
        [Description("Запланировано выездов на сегодня")]
        public int SheduledTodayCount { get; set; }
        [Description("Заказов в работе прямо сейчас")]
        public int InProgressNow { get; set; }
        [Description("Количество выполненных заявок за сегодня")]
        public int CompletedTodayCount { get; set; }
        [Description("Общий оборот за сегодня")]
        public decimal RevenueToday { get; set; }
        [Description("Расходы на запачсти за сегодня")]
        public decimal ExcpensesToday { get; set; }
        [Description("Выплаты мастерам за сегодня")]
        public decimal MasterPayoutsToday { get; set; }
        [Description("Чистая прибыль владельца")]
        public decimal OwnerProfitToday { get; set; }

    }
}
