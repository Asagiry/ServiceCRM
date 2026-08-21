using System.ComponentModel;

namespace ServiceCRM.DTOs.LeadSourceDTOs
{
    public class CreateAdExpenseDto
    {
        [Description("Сумма денег на рекламу")]
        public decimal Amount { get; set; }


        [Description("Дата списания / пополнения")]
        public DateTime ExpenseStartDate { get; set; } = DateTime.UtcNow;
    }
}
