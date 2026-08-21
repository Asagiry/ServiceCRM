using ServiceCRM.Class.Lead;
using ServiceCRM.DTOs.LeadSourceDTOs;

namespace ServiceCRM.Services.LeadSourceService
{
    public interface ILeadSourceService
    {
        // LeadSource CRUD
        public Task<List<LeadSource>> GetLeadSourcesAsync(
            CancellationToken ct = default);

        public Task<LeadSource?> GetLeadSourceByIdAsync(
            int id,
            CancellationToken ct = default);

        public Task<LeadSource> CreateLeadSourceAsync(
            CreateLeadSourceDto dto,
            CancellationToken ct = default);

        public Task<LeadSource?> UpdateLeadSourceAsync(
            int id, 
            UpdateLeadSourceDto dto,
            CancellationToken ct = default);

        public Task<LeadSource?> DeleteLeadSourceAsync(
            int id,
            CancellationToken ct = default);

        // AdExpence CD
        public Task<AdExpense?> CreateAdExpenseAsync(
            int leadSourceId,
            CreateAdExpenseDto dto,
            CancellationToken ct = default);

        public Task<AdExpense?> DeleteAdExpenseAsync(
            int id,
            CancellationToken ct = default);
    }
}
