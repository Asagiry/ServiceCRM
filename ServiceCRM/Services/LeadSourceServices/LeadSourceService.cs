using Microsoft.EntityFrameworkCore;
using ServiceCRM.Class.Lead;
using ServiceCRM.Common;
using ServiceCRM.DTOs.LeadSourceDTOs;
using ServiceCRM.Exceptions;

namespace ServiceCRM.Services.LeadSourceService
{
    public class LeadSourceService : ILeadSourceService
    {
        AppDbContext _context;

        public LeadSourceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<LeadSource>> GetLeadSourcesAsync(
            CancellationToken ct = default)
        {
            return await _context.LeadSources
                .AsNoTracking()
                .Include(x => x.AdExpenses)
                .ToListAsync(ct);
        }

        public async Task<LeadSource> GetLeadSourceByIdAsync(
            int id,
            CancellationToken ct = default)
        {
            return await _context.LeadSources
                .AsNoTracking()
                .Include(x => x.AdExpenses)
                .FirstOrDefaultAsync(x => x.Id == id, ct) 
                ?? throw new NotFoundException(ErrorMessages.LeadSourceNotFound(id));
        }

        public async Task<LeadSource> CreateLeadSourceAsync(
            CreateLeadSourceDto dto,
            CancellationToken ct = default)
        {
            LeadSource leadSource = new LeadSource(dto);

            _context.LeadSources.Add(leadSource);

            await _context.SaveChangesAsync(ct);

            return leadSource;
        }

      

        public async Task<LeadSource> UpdateLeadSourceAsync(
            int id, 
            UpdateLeadSourceDto dto,
            CancellationToken ct = default)
        {
            LeadSource leadSource = await _context.LeadSources.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.LeadSourceNotFound(id));

          
            leadSource.UpdateFromDto(dto);

            await _context.SaveChangesAsync(ct);

            return leadSource;
        }

        public async Task<LeadSource> DeleteLeadSourceAsync(
            int id,
            CancellationToken ct = default)
        {
            LeadSource leadSource = await _context.LeadSources.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.LeadSourceNotFound(id));

            _context.LeadSources.Remove(leadSource);

            await _context.SaveChangesAsync(ct);

            return leadSource;
        }

        public async Task<AdExpense> CreateAdExpenseAsync(
            int leadSourceId, 
            CreateAdExpenseDto dto,
            CancellationToken ct = default)
        {
            LeadSource leadSource = await _context.LeadSources.FirstOrDefaultAsync(x => x.Id == leadSourceId, ct)
                ?? throw new NotFoundException(ErrorMessages.LeadSourceNotFound(leadSourceId));

            AdExpense adExpense = new AdExpense(leadSourceId, dto);

            _context.AdExpenses.Add(adExpense);

            await _context.SaveChangesAsync(ct);

            return adExpense;

        }

        public async Task<AdExpense> DeleteAdExpenseAsync(
            int id,
            CancellationToken ct = default)
        {
            AdExpense adExpense = await _context.AdExpenses.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.AdExpenseNotFound(id));

            _context.AdExpenses.Remove(adExpense);

            await _context.SaveChangesAsync(ct);

            return adExpense;

        }

    }
}
