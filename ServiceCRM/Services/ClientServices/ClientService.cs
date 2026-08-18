using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using ServiceCRM.Class;
using ServiceCRM.DTOs.ClientDTOs;
using System.ComponentModel;
using System.Xml;

namespace ServiceCRM.Class
{
    public class ClientService: IClientService
    {
        AppDbContext _context;

        public ClientService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Client>> GetClientsAsync(string? search)
        {
            var query = _context.Clients.AsQueryable();

            if (search != null)
            {
                query = query.Where(x =>
                x.FullName.Contains(search) ||
                x.PhoneNumber.Contains(search) ||
                x.City.Contains(search));
            }

            return await query.ToListAsync();
        }

        public async Task<Client?> GetClientByIdAsync(int id)
        {
            return await _context.Clients
                .Include(c => c.Requests)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Client> CreateClientAsync(CreateClientDto dto)
        {
            Client client = new Client()
            {
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                City = dto.City
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            return client;
        }

        public async Task<Client?> UpdateClientAsync(int id,UpdateClientDto dto)
        {
            Client? toUpdate = await _context.Clients.FindAsync(id);

            if (toUpdate == null)
            {
                return null;
            }

            toUpdate.FullName = dto.FullName;
            toUpdate.PhoneNumber = dto.PhoneNumber;
            toUpdate.City = dto.City;

            await _context.SaveChangesAsync();

            return toUpdate;  
        }

        public async Task<Client?> DeleteClientAsync(int id)
        {
            Client? toDelete = await _context.Clients.FindAsync(id);

            if (toDelete == null)
                return null;

            _context.Clients.Remove(toDelete);
            await _context.SaveChangesAsync();

            return toDelete;
        }
    }
}