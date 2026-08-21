using Microsoft.EntityFrameworkCore;
using ServiceCRM.Class.Lead;
using ServiceCRM.DTOs.LeadSourceDTOs;

namespace ServiceCRM.Services.LeadSourceService
{
    public class LeadSourceService : ILeadSourceService
    {
        AppDbContext _context;

        public LeadSourceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<LeadSource>> GetLeadSourcesAsync()
        {
            return await _context.LeadSources
                .Include(x => x.AdExpenses)
                .ToListAsync();
        }

        public async Task<LeadSource?> GetLeadSourceByIdAsync(int id)
        {
            return await _context.LeadSources
                .Include(x => x.AdExpenses)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<LeadSource> CreateLeadSourceAsync(CreateLeadSourceDto dto)
        {
            LeadSource leadSource = new LeadSource(dto);

            _context.LeadSources.Add(leadSource);

            await _context.SaveChangesAsync();

            return leadSource;
        }

        public async Task<LeadSource?> UpdateLeadSourceAsync(int id, UpdateLeadSourceDto dto)
        {
            LeadSource? leadSource = await _context.LeadSources.FindAsync(id);

            if (leadSource == null)
            {
                return null;
            }

            leadSource.UpdateFromDto(dto);

            await _context.SaveChangesAsync();

            return leadSource;
        }

        public async Task<LeadSource?> DeleteLeadSourceAsync(int id)
        {
            LeadSource? leadSource = await _context.LeadSources.FindAsync(id);

            if (leadSource == null)
            {
                return null;
            }

            _context.LeadSources.Remove(leadSource);

            await _context.SaveChangesAsync();

            return leadSource;
        }

        public async Task<AdExpense?> CreateAdExpenseAsync(int leadSourceId, CreateAdExpenseDto dto)
        {
            LeadSource? leadSource = await _context.LeadSources.FindAsync(leadSourceId);

            if (leadSource == null)
            {
                return null;
            }

            AdExpense adExpense = new AdExpense(leadSourceId, dto);

            _context.AdExpenses.Add(adExpense);

            await _context.SaveChangesAsync();

            return adExpense;

        }

        public async Task<AdExpense?> DeleteAdExpenseAsync(int id)
        {
            AdExpense? adExpense = await _context.AdExpenses.FindAsync(id);

            if (adExpense == null)
            {
                return null;
            }

            _context.AdExpenses.Remove(adExpense);

            await _context.SaveChangesAsync();

            return adExpense;

        }

    }
}
