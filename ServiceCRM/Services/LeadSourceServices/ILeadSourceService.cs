using ServiceCRM.Models.Lead;
using ServiceCRM.DTOs.LeadSourceDTOs;
using ServiceCRM.Common;

namespace ServiceCRM.Services.LeadSourceService
{
    public interface ILeadSourceService
    {
        // LeadSource CRUD
        public Task<PagedResult<LeadSourceResponseDto>> GetLeadSourcesAsync(
            int page,
            int pageSize,
            CancellationToken ct = default);

        public Task<LeadSourceResponseDto> GetLeadSourceByIdAsync(
            int id,
            CancellationToken ct = default);

        public Task<LeadSourceResponseDto> CreateLeadSourceAsync(
            CreateLeadSourceDto dto,
            CancellationToken ct = default);

        public Task<LeadSourceResponseDto> UpdateLeadSourceAsync(
            int id, 
            UpdateLeadSourceDto dto,
            CancellationToken ct = default);

        public Task DeleteLeadSourceAsync(
            int id,
            CancellationToken ct = default);

        // AdExpence CD
        public Task<AdExpenseResponseDto> CreateAdExpenseAsync(
            int leadSourceId,
            CreateAdExpenseDto dto,
            CancellationToken ct = default);

        public Task DeleteAdExpenseAsync(
            int id,
            CancellationToken ct = default);
    }
}
