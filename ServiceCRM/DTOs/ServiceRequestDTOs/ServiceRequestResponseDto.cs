using ServiceCRM.Models.Request;
using System.ComponentModel;

namespace ServiceCRM.DTOs.ServiceRequestDTOs
{
    public class ServiceRequestResponseDto
    {
        [Description("Id заявки")]
        public int Id { get; set; }

        [Description("Город")]
        public required string City { get; set; }
        [Description("Адрес")]
        public required string Address { get; set; }
        [Description("Тип техники")]
        public required string EquipmentType { get; set; }
        [Description("Описание проблемы")]
        public required string ProblemDescription { get; set; }
        [Description("Дата выезда")]
        public DateTime? ScheduledAt { get; set; }
        [Description("Статус")]
        public RequestStatus Status { get; set; }



        [Description("Сумма заявки")]
        public decimal TotalPrice { get; set; }
        [Description("Прямые расходы")]
        public decimal DirectExpenses { get; set; }
        [Description("Выплата мастеру")]
        public decimal MasterPayout { get; set; }



        [Description("Id клиента")]
        public int ClientId { get; set; }
        [Description("Клиент")]
        public required string ClientFullName { get; set; }
        [Description("Телефон клиента")]
        public required string ClientPhoneNumber { get; set; }

        [Description("Id мастера")]
        public int? MasterId { get; set; }
        [Description("Мастер")]
        public string? MasterFullName { get; set; }

        [Description("Источник заявки")]
        public required string LeadSourceName { get; set; }

        [Description("Дата создания")]
        public DateTime CreatedAt { get; set; }
    }
}