using ServiceCRM.Class;
using ServiceCRM.DTOs.MasterDTOs;

namespace ServiceCRM.Services.MasterServices
{
    public interface IMasterService
    {
        public Task<List<Master>> GetMastersAsync(
            bool? isActive,
            string? search,
            CancellationToken ct = default);

        public Task<Master?> GetMasterByIdAsync(
            int id, 
            CancellationToken ct = default);

        public Task<Master> CreateMasterAsync(
            CreateMasterDto dto,
            CancellationToken ct = default);

        public Task<Master?> UpdateMasterAsync(
            int id, 
            UpdateMasterDto dto,
            CancellationToken ct = default);

        public Task<Master?> DeleteMasterAsync(
            int id,
            CancellationToken ct = default);

    }
}
