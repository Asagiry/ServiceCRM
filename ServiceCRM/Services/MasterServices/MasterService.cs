using Microsoft.EntityFrameworkCore;
using ServiceCRM.Class;
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

        public async Task<List<Master>> GetMastersAsync(
            bool? isActive,
            string? search,
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

            return await query.ToListAsync(ct);
        }
        public async Task<Master> GetMasterByIdAsync(
            int id,
            CancellationToken ct = default)
        {
            return await _context.Masters
                .AsNoTracking()
                .Include(x => x.Requests)
                .FirstOrDefaultAsync(c => c.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.MasterNotFound(id));
        }

        public async Task<Master> CreateMasterAsync(
            CreateMasterDto dto,
            CancellationToken ct)
        {
            Master master = new Master()
            {
                Fullname = dto.Fullname,
                PhoneNumber = dto.PhoneNumber,
                City = dto.City,
                Telegram = dto.Telegram,
                Specialization = dto.Specialization,
                CommissionPercent = dto.CommissionPercent,
                IsActive = dto.IsActive
            };

            _context.Masters.Add(master);

            await _context.SaveChangesAsync(ct);

            return master;

        }

        public async Task<Master> UpdateMasterAsync(
            int id, 
            UpdateMasterDto dto,
            CancellationToken ct = default)
        {
            Master master = await _context.Masters.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.MasterNotFound(id));

            master.Fullname = dto.Fullname;
            master.PhoneNumber = dto.PhoneNumber;
            master.City = dto.City;
            master.Telegram = dto.Telegram;
            master.Specialization = dto.Specialization;
            master.CommissionPercent = dto.CommissionPercent;
            master.IsActive = dto.IsActive;

            await _context.SaveChangesAsync(ct);

            return master;
        }

        public async Task<Master> DeleteMasterAsync(
            int id,
            CancellationToken ct = default)
        {
            Master master = await _context.Masters.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.MasterNotFound(id));

            _context.Masters.Remove(master);

            await _context.SaveChangesAsync(ct);

            return master;
        }

      
    }
}
