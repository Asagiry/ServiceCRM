using System.ComponentModel;

namespace ServiceCRM.DTOs.LeadSourceDTOs
{
    public class UpdateLeadSourceDto
    {
        [Description("Название лида")]
        public required string Name { get; set; }

        [Description("Url сайта")]
        public required string WebsiteUrl { get; set; }

        [Description("Плановый недельный расход")]
        public decimal TargetWeeklyBudget { get; set; }

        [Description("Используется ли этот лид в данный момент")]
        public bool IsActive { get; set; }
    }
}
