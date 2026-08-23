using ServiceCRM.DTOs.ServiceRequestDTOs;
using ServiceCRM.Models.Request;
using System.ComponentModel;

namespace ServiceCRM.DTOs.PaymentDTOs
{
    public static class PaymentMapping
    {
        public static PaymentResponseDto ToDto(this Payment p) => new()
        {
            Id = p.Id,
            ServiceRequestId = p.ServiceRequestId, 
            Amount = p.Amount,
            PaymentDate = p.PaymentDate,
            PaymentMethod = p.PaymentMethod
        };
    }
}
