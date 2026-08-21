using ServiceCRM.DTOs.ClientDTOs;

namespace ServiceCRM.Class
{
    public interface IClientService
    {
        public Task<List<Client>> GetClientsAsync(
            string? search, 
            CancellationToken ct = default);
        public Task<Client?> GetClientByIdAsync(
            int id, 
            CancellationToken ct = default);
        public Task<Client> CreateClientAsync(
            CreateClientDto dto,
            CancellationToken ct = default);
        public Task<Client?> UpdateClientAsync(
            int id, 
            UpdateClientDto dto,
            CancellationToken ct = default);
        public Task<Client?> DeleteClientAsync(
            int id,
            CancellationToken ct = default);
    }
}
