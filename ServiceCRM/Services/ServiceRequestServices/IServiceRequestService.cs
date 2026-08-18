using Microsoft.EntityFrameworkCore.Update.Internal;
using ServiceCRM.Class;
using ServiceCRM.DTOs.ServiceRequestDTOs;

namespace ServiceCRM.Services.ServiceRequestServices
{
    public interface IServiceRequestService
    {
        public Task<List<ServiceRequest>> GetServiceRequestsAsync(
            RequestStatus? status,
            int? masterId,
            DateTime? dateTime);

        public Task<ServiceRequest?> GetServiceRequestByIdAsync(int id);

        public Task<ServiceRequest> CreateServiceRequestAsync(CreateServiceRequestDto dto);

        public Task<ServiceRequest?> UpdateServiceRequestAsync(int id, UpdateServiceRequestDto dto);

        public Task<ServiceRequest?> CompleteServiceRequestAsync(int id, CompleteServiceRequestDto dto);

        public Task<ServiceRequest?> DeleteServiceRequestAsync(int id);


    }
}
