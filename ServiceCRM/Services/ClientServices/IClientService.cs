using ServiceCRM.DTOs.ClientDTOs;

namespace ServiceCRM.Class
{
    public interface IClientService
    {
        public Task<List<Client>> GetClientsAsync(string? search);
        public Task<Client?> GetClientByIdAsync(int id);
        public Task<Client> CreateClientAsync(CreateClientDto dto);
        public Task<Client?> UpdateClientAsync(int id, UpdateClientDto dto);
        public Task<Client?> DeleteClientAsync(int id);
    }
}
