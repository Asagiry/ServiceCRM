using Microsoft.EntityFrameworkCore.Update.Internal;
using ServiceCRM.Common;
using ServiceCRM.DTOs.ServiceRequestDTOs;
using ServiceCRM.Models.Request;

namespace ServiceCRM.Services.ServiceRequestServices
{
    public interface IServiceRequestService
    {
        public Task<PagedResult<ServiceRequestResponseDto>> GetServiceRequestsAsync(
            RequestStatus? status,
            int? masterId,
            DateTime? dateTime,
            int page,
            int pageSize,
            CancellationToken ct = default);

        public Task<ServiceRequestResponseDto> GetServiceRequestByIdAsync(
            int id,
            CancellationToken ct = default);

        public Task<ServiceRequestResponseDto> CreateServiceRequestAsync(
            CreateServiceRequestDto dto,
            CancellationToken ct = default);

        public Task<ServiceRequestResponseDto> UpdateServiceRequestAsync(
            int id, 
            UpdateServiceRequestDto dto,
            CancellationToken ct = default);

        public Task<ServiceRequestResponseDto> UpdateStatusServiceRequestAsync(
            int id,
            UpdateStatusServiceRequestDto dto,
            CancellationToken ct = default);

        public Task<ServiceRequestResponseDto> CompleteServiceRequestAsync(
            int id, 
            CompleteServiceRequestDto dto,
            CancellationToken ct = default);

        public Task DeleteServiceRequestAsync(
            int id,
            CancellationToken ct = default);

    }
}
