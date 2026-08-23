using ServiceCRM.DTOs.ServiceRequestDTOs;
using ServiceCRM.Models.Request;
using System.ComponentModel;

namespace ServiceCRM.DTOs.PaymentDTOs
{
    public class PaymentResponseDto
    {

        [Description("Id платежа")]
        public int Id { get; set; }
        [Description("Id заявки")]
        public int ServiceRequestId { get; set; }
        [Description("Сумма платежа")]
        public decimal Amount { get; set; }
        [Description("Дата платежа")]
        public DateTime PaymentDate { get; set; }
        [Description("Способ оплаты")]
        public PaymentMethod PaymentMethod { get; set; }

    }
}
