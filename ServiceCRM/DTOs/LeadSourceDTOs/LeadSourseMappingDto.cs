using ServiceCRM.Models.Lead;

namespace ServiceCRM.DTOs.LeadSourceDTOs
{
    public static class LeadSourseMappingDto
    {
        public static LeadSourceResponseDto ToDto(this LeadSource l) => new()
        {
            Id = l.Id,
            Name = l.Name,
            WebsiteUrl = l.WebsiteUrl,
            TargetWeeklyBudget = l.TargetWeeklyBudget,
            IsActive = l.IsActive,
            CreatedAt = l.CreatedAt,
            AdExpenses = l.AdExpenses.Select(a => a.ToDto()).ToList()
        };

        public static AdExpenseResponseDto ToDto(this AdExpense a) => new()
        {
            Id = a.Id,
            Amount = a.Amount,
            ExpenseStartDate = a.ExpenseStartDate,
            LeadSourceId = a.LeadSource?.Id ?? 0,
            LeadSourceName = a.LeadSource?.Name ?? ""
        };
    }
}
