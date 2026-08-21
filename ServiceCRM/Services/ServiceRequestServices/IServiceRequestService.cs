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
            DateTime? dateTime,
            CancellationToken ct = default);

        public Task<ServiceRequest> GetServiceRequestByIdAsync(
            int id,
            CancellationToken ct = default);

        public Task<ServiceRequest> CreateServiceRequestAsync(
            CreateServiceRequestDto dto,
            CancellationToken ct = default);

        public Task<ServiceRequest> UpdateServiceRequestAsync(
            int id, 
            UpdateServiceRequestDto dto,
            CancellationToken ct = default);

        public Task<ServiceRequest> CompleteServiceRequestAsync(
            int id, 
            CompleteServiceRequestDto dto,
            CancellationToken ct = default);

        public Task<ServiceRequest> DeleteServiceRequestAsync(
            int id,
            CancellationToken ct = default);


    }
}
