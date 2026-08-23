using ServiceCRM.DTOs.PaymentDTOs;
using ServiceCRM.Models.Request;
using ServiceCRM.Exceptions;
using ServiceCRM.Common;
using Microsoft.EntityFrameworkCore;

namespace ServiceCRM.Services.PaymentServices
{
    public class PaymentService : IPaymentService
    {
        AppDbContext _context;
        public PaymentService(AppDbContext context) 
        {
            _context = context;
        }

        public async Task<PaymentResponseDto> CreatePaymentByServiceRequestIdAsync(
            int requestId,
            CreatePaymentDto dto,
            CancellationToken ct)
        {
            ServiceRequest serviceRequest = await _context.ServiceRequests.FirstOrDefaultAsync(x => x.Id == requestId, ct)
                ?? throw new NotFoundException(ErrorMessages.ServiceRequestNotFound(requestId));

            if (serviceRequest.Status == RequestStatus.Cancelled)
                throw new BadRequestException("Нельзя внести оплату по отмененной заявке");

            bool alreadyPaid = await _context.Payments.AnyAsync(p => p.ServiceRequestId == requestId, ct);

            if (alreadyPaid)
                throw new BadRequestException("Заявка уже оплачена.");

            if (dto.Amount > serviceRequest.TotalPrice)
                throw new BadRequestException($"Сумма платежа ({dto.Amount} ₽) превышает стоимость заказа ({serviceRequest.TotalPrice} ₽)!");

            Payment payment = new Payment(requestId,dto);
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync(ct);

            return payment.ToDto();
        }

        public async Task<PaymentResponseDto> GetPaymentByServiceRequestIdAsync(
            int requestId,
            CancellationToken ct)
        {
            var result = await _context.Payments
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.ServiceRequestId == requestId, ct)
                ?? throw new NotFoundException(ErrorMessages.PaymentNotFound(requestId));

            return result.ToDto();
        }
    }
}
