using ServiceCRM.Models.Request;
using System.ComponentModel;

namespace ServiceCRM.DTOs.PaymentDTOs
{
    public class CreatePaymentDto
    {
        [Description("Сумма платежа")]
        public decimal Amount { get; set; }
        [Description("Дата платежа")]
        public DateTime PaymentDate { get; set; }
        [Description("Метод платежа")]
        public required PaymentMethod PaymentMethod { get; set; }
    }
}
