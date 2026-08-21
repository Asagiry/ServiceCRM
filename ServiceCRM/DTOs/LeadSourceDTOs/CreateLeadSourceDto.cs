using ServiceCRM.Class.Lead;
using System.ComponentModel;

namespace ServiceCRM.DTOs.LeadSourceDTOs
{
    public class CreateLeadSourceDto
    {
        [Description("Название лида")]
        public required string Name { get; set; }

        [Description("Url сайта")]
        public required string WebsiteUrl { get; set; }

        [Description("Плановый недельный расход")]
        public decimal TargetWeeklyBudget { get; set; }
    }
}
