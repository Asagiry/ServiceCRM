using ServiceCRM.Class.Laed;
using ServiceCRM.DTOs.LeadSourceDTOs;
using System.ComponentModel;
using System.Diagnostics.CodeAnalysis;

namespace ServiceCRM.Class.Lead
{
    [Description("Расход на рекламу текущего источника")]
    public class AdExpense
    {
        //Nav
        public LeadSource? LeadSource { get; set; }


        [Description("Id расхода")]
        public int Id { get; set; }


        [Description("Id источника лидов")]
        public int LeadSourceId { get; set; }


        [Description("Сумма денег на рекламу")]
        public decimal Amount { get; set; }


        [Description("Дата списания / пополнения")]
        public DateTime ExpenseStartDate { get; set; } = DateTime.UtcNow;

        public AdExpense() { }

        [SetsRequiredMembers]
        public AdExpense(int leadSourceId,CreateAdExpenseDto dto)
        {
            LeadSourceId = leadSourceId;
            Amount = dto.Amount;
            ExpenseStartDate = dto.ExpenseStartDate;
        }

    }
}
