using ServiceCRM.Class.Laed;
using ServiceCRM.Class.Lead;
using ServiceCRM.DTOs.LeadSourceDTOs;

namespace ServiceCRM.Services.LeadSourceService
{
    public interface ILeadSourceService
    {
        // LeadSource CRUD
        public Task<List<LeadSource>> GetLeadSourcesAsync();
        public Task<LeadSource?> GetLeadSourceByIdAsync(int id);
        public Task<LeadSource> CreateLeadSourceAsync(CreateLeadSourceDto dto);
        public Task<LeadSource?> UpdateLeadSourceAsync(int id, UpdateLeadSourceDto dto);
        public Task<LeadSource?> DeleteLeadSourceAsync(int id);

        // AdExpence CD
        public Task<AdExpense?> CreateAdExpenseAsync(int leadSourceId, CreateAdExpenseDto dto);
        public Task<AdExpense?> DeleteAdExpenseAsync(int id);
    }
}
