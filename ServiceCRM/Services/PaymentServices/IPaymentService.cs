using ServiceCRM.DTOs.PaymentDTOs;
using ServiceCRM.Models.Request;

namespace ServiceCRM.Services.PaymentServices
{
    public interface IPaymentService
    {
        public Task<Payment> CreatePaymentByServiceRequestIdAsync(
            int requestId,
            CreatePaymentDto dto,
            CancellationToken ct);

        public Task<Payment> GetPaymentByServiceRequestIdAsync(
            int requestId,
            CancellationToken ct);
    }
}
