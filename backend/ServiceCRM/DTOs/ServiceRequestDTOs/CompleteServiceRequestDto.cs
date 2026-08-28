using ServiceCRM.Models;
using System.ComponentModel;

namespace ServiceCRM.DTOs.ServiceRequestDTOs
{
    public class CompleteServiceRequestDto
    {
        [Description("Сумма заявки")]
        public decimal TotalPrice { get; set; }
        [Description("Затраты на ремонт")]
        public decimal DirectExpenses { get; set; }

        [Description("Выплата мастеру")]
        public decimal? MasterPayout { get; set; }
    }
}
