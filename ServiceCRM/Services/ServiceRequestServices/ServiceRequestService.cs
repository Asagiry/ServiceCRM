
using Microsoft.EntityFrameworkCore;
using ServiceCRM.DTOs.ServiceRequestDTOs;
using ServiceCRM.Exceptions;
using ServiceCRM.Common;
using ServiceCRM.Models.Request;
using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using StackExchange.Redis;

namespace ServiceCRM.Services.ServiceRequestServices
{
    public class ServiceRequestService : IServiceRequestService
    {
        AppDbContext _context;

        public ServiceRequestService(AppDbContext context)
        {
            _context = context;
        }


        public async Task<PagedResult<ServiceRequestResponseDto>> GetServiceRequestsAsync(
            RequestStatus? status,
            int? masterId,
            DateTime? dateTime,
            int page,
            int pageSize,
            CancellationToken ct = default)
        {
            var query = _context.ServiceRequests.AsNoTracking();

            if (status != null)
            {
                query = query.Where(x => x.Status == status);
            }

            if (masterId != null)
            {
                query = query.Where(x => x.MasterId == masterId);
            }

            if (dateTime != null)
            {
                DateTime startOfDay = dateTime.Value.Date;            
                DateTime startOfNextDay = startOfDay.AddDays(1); 
                query = query.Where(x => x.CreatedAt >= startOfDay && x.CreatedAt < startOfNextDay);
            }


            var result = await query
                .Include(x => x.Master)
                .Include(x => x.Client)
                .Include(x => x.LeadSource)
                .OrderByDescending(x => x.CreatedAt)
                .ToPagedListAsync(page, pageSize, ct);

            return result.Map(x => x.ToDto());

        }

        public async Task<ServiceRequestResponseDto> GetServiceRequestByIdAsync(
            int id,
            CancellationToken ct = default)
        {
            var result = await _context.ServiceRequests
                .AsNoTracking()
                .Include(x => x.Master)
                .Include(x => x.Client)
                .Include(x => x.LeadSource)
                .FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.ServiceRequestNotFound(id));

            return result.ToDto();
        }
        public async Task<ServiceRequestResponseDto> CreateServiceRequestAsync(
            CreateServiceRequestDto dto,
            CancellationToken ct = default)
        {
            ServiceRequest serviceRequest = new ServiceRequest(dto);
         
            _context.ServiceRequests.Add(serviceRequest);

            await _context.SaveChangesAsync(ct);

            return serviceRequest.ToDto();
         }
        public async Task<ServiceRequestResponseDto> UpdateServiceRequestAsync(
            int id, 
            UpdateServiceRequestDto dto,
            CancellationToken ct = default)
        {
            ServiceRequest serviceRequest = await _context.ServiceRequests.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.ServiceRequestNotFound(id));

            serviceRequest.UpdateServiceRequest(dto);

            await _context.SaveChangesAsync(ct);

            return serviceRequest.ToDto();
        }

        public async Task<ServiceRequestResponseDto> CompleteServiceRequestAsync(
            int id, 
            CompleteServiceRequestDto dto,
            CancellationToken ct = default)
        {
            ServiceRequest serviceRequest = await _context.ServiceRequests.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.ServiceRequestNotFound(id));

            serviceRequest.CompleteServiceRequest(dto);

            await _context.SaveChangesAsync(ct);

            return serviceRequest.ToDto();
        }

        

        public async Task DeleteServiceRequestAsync(
            int id,
            CancellationToken ct = default)
        {
            ServiceRequest? serviceRequest = await _context.ServiceRequests.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.ServiceRequestNotFound(id));

            _context.ServiceRequests.Remove(serviceRequest);

            await _context.SaveChangesAsync(ct);
        }

    }
}
