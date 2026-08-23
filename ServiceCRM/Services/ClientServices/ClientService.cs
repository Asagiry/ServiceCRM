using Microsoft.EntityFrameworkCore;
using ServiceCRM.Common;
using ServiceCRM.DTOs.ClientDTOs;
using ServiceCRM.Exceptions;

using ServiceCRM.Models;

namespace ServiceCRM.Services.ClientServices
{
    public class ClientService: IClientService
    {
        AppDbContext _context;

        public ClientService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Client>> GetClientsAsync(
            string? search,
            CancellationToken ct = default)
        {
            var query = _context.Clients.AsNoTracking();

            if (search != null)
            {
                query = query.Where(x =>
                x.FullName.Contains(search) ||
                x.PhoneNumber.Contains(search) ||
                x.City.Contains(search));
            }

            return await query.ToListAsync(ct);
        }

        public async Task<Client> GetClientByIdAsync(
            int id,
            CancellationToken ct = default)
        {
            return await _context.Clients
                .AsNoTracking()
                .Include(c => c.Requests)
                .FirstOrDefaultAsync(c => c.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.ClientNotFound(id));
        }

        public async Task<Client> CreateClientAsync(
            CreateClientDto dto,
            CancellationToken ct = default)
        {
            Client client = new Client()
            {
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                City = dto.City
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync(ct);

            return client;
        }

        public async Task<Client> UpdateClientAsync(
            int id,
            UpdateClientDto dto,
            CancellationToken ct = default)
        {
            Client toUpdate = await _context.Clients.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.ClientNotFound(id));


            toUpdate.FullName = dto.FullName;
            toUpdate.PhoneNumber = dto.PhoneNumber;
            toUpdate.City = dto.City;

            await _context.SaveChangesAsync(ct);

            return toUpdate;  
        }

        public async Task<Client> DeleteClientAsync(
            int id,
            CancellationToken ct = default)
        {
            Client toDelete = await _context.Clients.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.ClientNotFound(id));

            _context.Clients.Remove(toDelete);
            await _context.SaveChangesAsync(ct);

            return toDelete;
        }
    }
}