using ServiceCRM.Models;
using ServiceCRM.DTOs.MasterDTOs;
using ServiceCRM.Common;

namespace ServiceCRM.Services.MasterServices
{
    public interface IMasterService
    {
        public Task<PagedResult<MasterResponseDto>> GetMastersAsync(
            bool? isActive,
            string? search,
            int page,
            int pageSize,
            CancellationToken ct = default);

        public Task<MasterDetailedResponseDto> GetMasterByIdAsync(
            int id, 
            CancellationToken ct = default);

        public Task<MasterResponseDto> CreateMasterAsync(
            CreateMasterDto dto,
            CancellationToken ct = default);

        public Task<MasterResponseDto> UpdateMasterAsync(
            int id, 
            UpdateMasterDto dto,
            CancellationToken ct = default);

        public Task DeleteMasterAsync(
            int id,
            CancellationToken ct = default);

    }
}
