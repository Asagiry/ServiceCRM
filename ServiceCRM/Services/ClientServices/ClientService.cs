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

        public async Task<PagedResult<ClientResponseDto>> GetClientsAsync(
            string? search,
            int page,
            int pageSize,
            CancellationToken ct = default)
        {
            var query = _context.Clients
                .AsNoTracking();            

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(x =>
                x.FullName.Contains(search) ||
                x.PhoneNumber.Contains(search) ||
                x.City.Contains(search));
            }

            var paged = await query.OrderByDescending(x => x.CreatedAt)
                            .ToPagedListAsync(page, pageSize, ct);

            return paged.Map(x => x.ToDto());


        }

        public async Task<ClientDetailedResponseDto> GetClientByIdAsync(
            int id,
            CancellationToken ct = default)
        {
            var clientDetailed = await _context.Clients
                .AsNoTracking()
                .Include(c => c.Requests)
                    .ThenInclude(r => r.Master)       
                .Include(c => c.Requests)
                    .ThenInclude(r => r.LeadSource)   
                .FirstOrDefaultAsync(c => c.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.ClientNotFound(id));

            return clientDetailed.ToDetailedDto();
        }

        public async Task<ClientResponseDto> CreateClientAsync(
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

            return client.ToDto();
        }

        public async Task<ClientResponseDto> UpdateClientAsync(
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

            return toUpdate.ToDto();  
        }

        public async Task DeleteClientAsync(
            int id,
            CancellationToken ct = default)
        {
            Client toDelete = await _context.Clients.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.ClientNotFound(id));

            _context.Clients.Remove(toDelete);
            await _context.SaveChangesAsync(ct);
        }
    }
}