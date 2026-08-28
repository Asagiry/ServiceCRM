
using Microsoft.EntityFrameworkCore;
using ServiceCRM.Common;
using ServiceCRM.DTOs.ServiceRequestDTOs;
using ServiceCRM.Exceptions;
using ServiceCRM.Models;
using ServiceCRM.Models.Request;
using StackExchange.Redis;
using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;

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
                // CreatedAt хранится в UTC (timestamptz) — границы дня тоже должны быть UTC,
                // иначе Npgsql падает: "Cannot write DateTime with Kind=Unspecified"
                DateTime startOfDay = DateTime.SpecifyKind(dateTime.Value.Date, DateTimeKind.Utc);
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

        public async Task<ServiceRequestResponseDto> UpdateStatusServiceRequestAsync(
            int id,
            UpdateStatusServiceRequestDto dto,
            CancellationToken ct = default)
        {
            ServiceRequest serviceRequest = await _context.ServiceRequests.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.ServiceRequestNotFound(id));

            RequestStatus currentStatus = serviceRequest.Status;
            RequestStatus newStatus = dto.Status;

            EnsureTransitionAllowed(currentStatus, newStatus);

            if (newStatus == RequestStatus.Cancelled && await _context.Payments.AnyAsync(p => p.ServiceRequestId == id))
            {
                throw new ConflictException("Невозможно отменить заявку с внесеным платежом");
            }

            serviceRequest.Status = newStatus;

            await _context.SaveChangesAsync(ct);

            return serviceRequest.ToDto();
        }

        public async Task<ServiceRequestResponseDto> CompleteServiceRequestAsync(
            int id, 
            CompleteServiceRequestDto dto,
            CancellationToken ct = default)
        {
            ServiceRequest serviceRequest = await _context.ServiceRequests
                .Include(x => x.Master)
                .FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException(ErrorMessages.ServiceRequestNotFound(id));

            EnsureTransitionAllowed(serviceRequest.Status, RequestStatus.Completed);

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

            serviceRequest.IsDeleted = true;
            serviceRequest.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(ct);
        }



        private static readonly Dictionary<RequestStatus, RequestStatus[]> AllowedTransitions =
        new()
        {
            [RequestStatus.New]        = [RequestStatus.Assigned, RequestStatus.Cancelled],
            [RequestStatus.Assigned]   = [RequestStatus.InProgress, RequestStatus.Completed, RequestStatus.Cancelled],
            [RequestStatus.InProgress] = [RequestStatus.Completed, RequestStatus.Cancelled],
        };

        private void EnsureTransitionAllowed(RequestStatus currentStatus, RequestStatus targetStatus)
        {
            if (!AllowedTransitions.TryGetValue(currentStatus, out var allowed) || !allowed.Contains(targetStatus))
            {
                throw new ConflictException($"Недопустимый переход статуса из '{currentStatus}' в '{targetStatus}'.");
            }
        }

    }
}
