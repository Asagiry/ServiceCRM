using Microsoft.EntityFrameworkCore;
using ServiceCRM.Models.Lead;
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

        public async Task<PagedResult<LeadSourceResponseDto>> GetLeadSourcesAsync(
            int page,
            int pageSize,
            CancellationToken ct = default)
        {
            var resulut = await _context.LeadSources
                .AsNoTracking()
                .Include(x => x.AdExpenses)
                .ToPagedListAsync(page, pageSize, ct);

            return resulut.Map(x => x.ToDto());
        }

        public async Task<LeadSourceResponseDto> GetLeadSourceByIdAsync(
            int id,
            CancellationToken ct = default)
        {
            var result = await _context.LeadSources
                .AsNoTracking()
                .Include(x => x.AdExpenses)
                .FirstOrDefaultAsync(x => x.Id == id, ct) 
                ?? throw new NotFoundException(ErrorMessages.LeadSourceNotFound(id));

            return result.ToDto();
        }

        public async Task<LeadSourceResponseDto> CreateLeadSourceAsync(
            CreateLeadSourceDto dto,
            CancellationToken ct = default)
        {
            LeadSource leadSource = new LeadSource(dto);

            _context.LeadSources.Add(leadSource);

            await _context.SaveChangesAsync(ct);

            return leadSource.ToDto();
        }

      

        public async Task<LeadSourceResponseDto> UpdateLeadSourceAsync(
            int id, 
            UpdateLeadSourceDto dto,
            CancellationToken ct = default)
        {
            LeadSource leadSource = await _context.LeadSources.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.LeadSourceNotFound(id));

          
            leadSource.UpdateFromDto(dto);

            await _context.SaveChangesAsync(ct);

            return leadSource.ToDto();
        }

        public async Task DeleteLeadSourceAsync(
            int id,
            CancellationToken ct = default)
        {
            LeadSource leadSource = await _context.LeadSources.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.LeadSourceNotFound(id));

            _context.LeadSources.Remove(leadSource);

            await _context.SaveChangesAsync(ct);
        }

        public async Task<AdExpenseResponseDto> CreateAdExpenseAsync(
            int leadSourceId, 
            CreateAdExpenseDto dto,
            CancellationToken ct = default)
        {
            LeadSource leadSource = await _context.LeadSources.FirstOrDefaultAsync(x => x.Id == leadSourceId, ct)
                ?? throw new NotFoundException(ErrorMessages.LeadSourceNotFound(leadSourceId));

            AdExpense adExpense = new AdExpense(leadSourceId, dto);

            _context.AdExpenses.Add(adExpense);

            await _context.SaveChangesAsync(ct);

            return adExpense.ToDto();

        }

        public async Task DeleteAdExpenseAsync(
            int id,
            CancellationToken ct = default)
        {
            AdExpense adExpense = await _context.AdExpenses.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.AdExpenseNotFound(id));

            _context.AdExpenses.Remove(adExpense);

            await _context.SaveChangesAsync(ct);
        }

    }
}
