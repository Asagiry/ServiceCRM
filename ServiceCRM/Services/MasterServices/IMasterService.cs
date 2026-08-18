using ServiceCRM.Class;
using ServiceCRM.DTOs.MasterDTOs;

namespace ServiceCRM.Services.MasterServices
{
    public interface IMasterService
    {
        public Task<List<Master>> GetMastersAsync(bool? isActive, string? search);
        public Task<Master?> GetMasterByIdAsync(int id);
        public Task<Master> CreateMasterAsync(CreateMasterDto dto);
        public Task<Master?> UpdateMasterAsync(int id, UpdateMasterDto dto);
        public Task<Master?> DeleteMasterAsync(int id);
    }
}
