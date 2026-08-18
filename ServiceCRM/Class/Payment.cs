using System.ComponentModel;

namespace ServiceCRM.Class
{
    public class Payment
    {
        //Навигационные свойства 
        public ServiceRequest? ServiceRequest { get; set; }

        [Description("Id платежа")]
        public int Id { get; set; }
        [Description("Id заявки этого платежа")]
        public int ServiceRequestId { get; set; }
        [Description("Сумма платежа")]
        public decimal Amount { get; set; }
        [Description("Дата платежа")]
        public DateTime PaymentDate { get; set; }
        [Description("Метод платежа")]
        public required PaymentMethod PaymentMethod { get; set; }
    }

    public enum PaymentMethod
    {
        /// <summary>
        /// Оплата наличными
        /// </summary>
        Cash = 0,
        /// <summary>
        /// Оплата онлайн (перевод, сбп, etc)
        /// </summary>
        Online = 1,
        /// <summary>
        /// Оплата вживую с помощью терминала
        /// </summary>
        Terminal = 2,
    }
}
