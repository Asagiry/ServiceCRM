using Microsoft.EntityFrameworkCore;
using ServiceCRM.Class;
using ServiceCRM.DTOs.MasterDTOs;
using System.ComponentModel;

namespace ServiceCRM.Services.MasterServices
{
    public class MasterService : IMasterService
    {
        AppDbContext _context;
        public MasterService(AppDbContext context) 
        {
            _context = context;
        }

        public async Task<List<Master>> GetMastersAsync(bool? isActive, string? search)
        {
            var query = _context.Masters.AsQueryable();

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

            return await query.ToListAsync();
        }
        public async Task<Master?> GetMasterByIdAsync(int id)
        {
            return await _context.Masters
                .Include(x => x.Requests)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Master> CreateMasterAsync(CreateMasterDto dto)
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

            await _context.SaveChangesAsync();

            return master;

        }

        public async Task<Master?> UpdateMasterAsync(int id, UpdateMasterDto dto)
        {
            Master? master = await _context.Masters.FindAsync(id);

            if (master == null)
            {
                return null;
            }

            master.Fullname = dto.Fullname;
            master.PhoneNumber = dto.PhoneNumber;
            master.City = dto.City;
            master.Telegram = dto.Telegram;
            master.Specialization = dto.Specialization;
            master.CommissionPercent = dto.CommissionPercent;
            master.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return master;
        }

        public async Task<Master?> DeleteMasterAsync(int id)
        {
            Master? master = await _context.Masters.FindAsync(id);

            if (master == null)
            {
                return null;
            }

            _context.Masters.Remove(master);

            await _context.SaveChangesAsync();

            return master;
        }

      
    }
}
