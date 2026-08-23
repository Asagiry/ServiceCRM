using ServiceCRM.Models.Lead;
using System.ComponentModel;

namespace ServiceCRM.DTOs.LeadSourceDTOs
{
    public class AdExpenseResponseDto
    {
        [Description("Id расхода")]
        public int Id { get; set; }

        [Description("Сумма денег на рекламу")]
        public decimal Amount { get; set; }

        [Description("Дата списания / пополнения")]
        public DateTime ExpenseStartDate { get; set; } = DateTime.UtcNow;

        [Description("Id источника лидов")]
        public int LeadSourceId { get; set; }

        [Description("Название лида")]
        public string LeadSourceName { get; set; } = "";
    }
}
