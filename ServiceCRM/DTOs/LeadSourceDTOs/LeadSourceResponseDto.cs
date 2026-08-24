using ServiceCRM.Models.Lead;
using System.ComponentModel;

namespace ServiceCRM.DTOs.LeadSourceDTOs
{
    public class LeadSourceResponseDto
    {
        [Description("Id лида")]
        public int Id { get; set; }

        [Description("Название лида")]
        public required string Name { get; set; }

        [Description("Url сайта")]
        public required string WebsiteUrl { get; set; }

        [Description("Плановый недельный расход")]
        public decimal TargetWeeklyBudget { get; set; }    

        [Description("Используется ли этот лид в данный момент")]
        public bool IsActive { get; set; } = true;

        [Description("Дата создания источника")]
        public DateTime CreatedAt { get; set; }

        [Description("Рекламные компании")]
        public List<AdExpenseResponseDto> AdExpenses { get; set; } = [];
    }
}
