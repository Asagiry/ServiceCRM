using Microsoft.EntityFrameworkCore;
using ServiceCRM.Models;
using ServiceCRM.Common;
using ServiceCRM.DTOs.MasterDTOs;
using ServiceCRM.Exceptions;

namespace ServiceCRM.Services.MasterServices
{
    public class MasterService : IMasterService
    {
        AppDbContext _context;
        public MasterService(AppDbContext context) 
        {
            _context = context;
        }

        public async Task<PagedResult<MasterResponseDto>> GetMastersAsync(
            bool? isActive,
            string? search,
            int page,
            int pageSize,
            CancellationToken ct = default)
        {
            var query = _context.Masters.AsNoTracking();

            if (isActive != null)
            {
                query = query.Where(x => x.IsActive == isActive);
            }

            if (search != null)
            {
                query = query.Where(x =>
                x.Fullname.Contains(search) ||
                x.PhoneNumber.Contains(search)||
                x.City.Contains(search));
            }

            var mastersPaged = await query
                .OrderByDescending(x => x.IsActive)
                .ThenBy(x => x.Id)
                .ToPagedListAsync(page, pageSize, ct);

            return mastersPaged.Map(x => x.ToDto());
        }


        public async Task<MasterDetailedResponseDto> GetMasterByIdAsync(
            int id,
            CancellationToken ct = default)
        {
            var master = await _context.Masters
                .AsNoTracking()
                .Include(x => x.Requests)
                .FirstOrDefaultAsync(c => c.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.MasterNotFound(id));


            return master.ToDetailedDto();
        }

        public async Task<MasterResponseDto> CreateMasterAsync(
            CreateMasterDto dto,
            CancellationToken ct)
        {
            Master master = new Master(dto);

            _context.Masters.Add(master);

            await _context.SaveChangesAsync(ct);

            return master.ToDto();

        }

        public async Task<MasterResponseDto> UpdateMasterAsync(
            int id, 
            UpdateMasterDto dto,
            CancellationToken ct = default)
        {
            Master master = await _context.Masters.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.MasterNotFound(id));

            master.UpdateFromDto(dto);
           
            await _context.SaveChangesAsync(ct);

            return master.ToDto();
        }

        public async Task DeleteMasterAsync(
            int id,
            CancellationToken ct = default)
        {
            Master master = await _context.Masters.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.MasterNotFound(id));

            master.IsDeleted = true;
            master.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(ct);
        }

      
    }
}
