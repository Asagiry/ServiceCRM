using ServiceCRM.Common;
using ServiceCRM.DTOs.ClientDTOs;

using ServiceCRM.Models;

namespace ServiceCRM.Services.ClientServices
{
    public interface IClientService
    {
        public Task<PagedResult<ClientResponseDto>> GetClientsAsync(
            string? search,
            int page,
            int pageSize,
            CancellationToken ct = default);
        public Task<ClientDetailedResponseDto> GetClientByIdAsync(
            int id, 
            CancellationToken ct = default);
        public Task<ClientResponseDto> CreateClientAsync(
            CreateClientDto dto,
            CancellationToken ct = default);
        public Task<ClientResponseDto> UpdateClientAsync(
            int id, 
            UpdateClientDto dto,
            CancellationToken ct = default);
        public Task DeleteClientAsync(
            int id,
            CancellationToken ct = default);
    }
}
