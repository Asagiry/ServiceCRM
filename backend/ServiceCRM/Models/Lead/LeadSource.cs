using ServiceCRM.DTOs.LeadSourceDTOs;
using System.ComponentModel;
using System.Diagnostics.CodeAnalysis;

namespace ServiceCRM.Models.Lead
{
    [Description("Источник лидов")]
    public class LeadSource
    {
        [Description("Id лида")]
        public int Id { get; set; }

        [Description("Название лида")]
        public required string Name { get; set; }

        [Description("Url сайта")]
        public required string WebsiteUrl { get; set; }

        [Description("Плановый недельный расход")]
        public decimal TargetWeeklyBudget { get; set; }

        [Description("Рекламные компании")]
        public List<AdExpense> AdExpenses { get; set; } = [];

        [Description("Используется ли этот лид в данный момент")]
        public bool IsActive { get; set; } = true;

        [Description("Дата создания источника")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        public LeadSource() { }


        [SetsRequiredMembers]
        public LeadSource(CreateLeadSourceDto dto)
        {
            Name = dto.Name;
            WebsiteUrl = dto.WebsiteUrl;
            TargetWeeklyBudget = dto.TargetWeeklyBudget;
        }

        public void UpdateFromDto(UpdateLeadSourceDto dto)
        {
            Name = dto.Name;
            WebsiteUrl = dto.WebsiteUrl;
            TargetWeeklyBudget = dto.TargetWeeklyBudget;
            IsActive = dto.IsActive;
        }
    }
}
