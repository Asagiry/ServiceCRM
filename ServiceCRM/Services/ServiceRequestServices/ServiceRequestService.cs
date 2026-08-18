
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


        public async Task<List<ServiceRequest>> GetServiceRequestsAsync(RequestStatus? status, int? masterId, DateTime? dateTime)
        {
            var query = _context.ServiceRequests.AsQueryable();

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
                .ToListAsync();
        }

        public async Task<ServiceRequest?> GetServiceRequestByIdAsync(int id)
        {
            return await _context.ServiceRequests
                .Include(x => x.Master)
                .Include(x => x.Client)
                .FirstOrDefaultAsync(x => x.Id == id);
        }
        public async Task<ServiceRequest> CreateServiceRequestAsync(CreateServiceRequestDto dto)
        {
            ServiceRequest serviceRequest = new ServiceRequest(dto);
         

            _context.ServiceRequests.Add(serviceRequest);

            await _context.SaveChangesAsync();

            return serviceRequest;
         }
        public async Task<ServiceRequest?> UpdateServiceRequestAsync(int id, UpdateServiceRequestDto dto)
        {
            ServiceRequest? serviceRequest = await _context.ServiceRequests.FindAsync(id);

            if (serviceRequest == null)
            {
                return null;
            }

            serviceRequest.UpdateServiceRequest(dto);

            await _context.SaveChangesAsync();

            return serviceRequest;
        }

        public async Task<ServiceRequest?> CompleteServiceRequestAsync(int id, CompleteServiceRequestDto dto)
        {
            ServiceRequest? serviceRequest = await _context.ServiceRequests.FindAsync(id);

            if (serviceRequest == null)
            {
                return null;
            }

            serviceRequest.CompleteServiceRequest(dto);

            await _context.SaveChangesAsync();

            return serviceRequest;
        }

        

        public async Task<ServiceRequest?> DeleteServiceRequestAsync(int id)
        {
            ServiceRequest? serviceRequest = await _context.ServiceRequests.FindAsync(id);

            if (serviceRequest == null)
            {
                return null;
            }

            _context.ServiceRequests.Remove(serviceRequest);

            await _context.SaveChangesAsync();

            return serviceRequest;
        }

    }
}
