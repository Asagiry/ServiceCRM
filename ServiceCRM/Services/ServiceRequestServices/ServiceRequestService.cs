
using Microsoft.EntityFrameworkCore;
using ServiceCRM.Class;
using ServiceCRM.DTOs.ServiceRequestDTOs;
using System.ComponentModel;

namespace ServiceCRM.Services.ServiceRequestServices
{
    public class ServiceRequestService : IServiceRequestService
    {
        AppDbContext _context;

        public ServiceRequestService(AppDbContext context)
        {
            _context = context;
        }


        public async Task<List<ServiceRequest>> GetServiceRequestsAsync(
            RequestStatus? status,
            int? masterId,
            DateTime? dateTime,
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

            return await query
                .Include(x => x.Master)
                .Include(x => x.Client)
                .ToListAsync(ct);
        }

        public async Task<ServiceRequest?> GetServiceRequestByIdAsync(
            int id,
            CancellationToken ct = default)
        {
            return await _context.ServiceRequests
                .AsNoTracking()
                .Include(x => x.Master)
                .Include(x => x.Client)
                .FirstOrDefaultAsync(x => x.Id == id, ct);
        }
        public async Task<ServiceRequest> CreateServiceRequestAsync(
            CreateServiceRequestDto dto,
            CancellationToken ct = default)
        {
            ServiceRequest serviceRequest = new ServiceRequest(dto);
         

            _context.ServiceRequests.Add(serviceRequest);

            await _context.SaveChangesAsync(ct);

            return serviceRequest;
         }
        public async Task<ServiceRequest?> UpdateServiceRequestAsync(
            int id, 
            UpdateServiceRequestDto dto,
            CancellationToken ct = default)
        {
            ServiceRequest? serviceRequest = await _context.ServiceRequests.FirstOrDefaultAsync(x => x.Id == id, ct);

            if (serviceRequest == null)
            {
                return null;
            }

            serviceRequest.UpdateServiceRequest(dto);

            await _context.SaveChangesAsync(ct);

            return serviceRequest;
        }

        public async Task<ServiceRequest?> CompleteServiceRequestAsync(
            int id, 
            CompleteServiceRequestDto dto,
            CancellationToken ct = default)
        {
            ServiceRequest? serviceRequest = await _context.ServiceRequests.FirstOrDefaultAsync(x => x.Id == id, ct);

            if (serviceRequest == null)
            {
                return null;
            }

            serviceRequest.CompleteServiceRequest(dto);

            await _context.SaveChangesAsync(ct);

            return serviceRequest;
        }

        

        public async Task<ServiceRequest?> DeleteServiceRequestAsync(
            int id,
            CancellationToken ct = default)
        {
            ServiceRequest? serviceRequest = await _context.ServiceRequests.FirstOrDefaultAsync(x => x.Id == id, ct);

            if (serviceRequest == null)
            {
                return null;
            }

            _context.ServiceRequests.Remove(serviceRequest);

            await _context.SaveChangesAsync(ct);

            return serviceRequest;
        }

    }
}
