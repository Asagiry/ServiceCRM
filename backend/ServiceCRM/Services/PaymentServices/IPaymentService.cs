using ServiceCRM.DTOs.PaymentDTOs;
using ServiceCRM.Models.Request;

namespace ServiceCRM.Services.PaymentServices
{
    public interface IPaymentService
    {
        public Task<PaymentResponseDto> CreatePaymentByServiceRequestIdAsync(
            int requestId,
            CreatePaymentDto dto,
            CancellationToken ct);

        public Task<PaymentResponseDto> GetPaymentByServiceRequestIdAsync(
            int requestId,
            CancellationToken ct);
    }
}
