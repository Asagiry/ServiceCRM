using ServiceCRM.Class;
using System.ComponentModel;

namespace ServiceCRM.DTOs.ServiceRequestDTOs
{
    public class UpdateServiceRequestDto 
    {
        [Description("Id клиента")]
        public int ClientId { get; set; }
        [Description("Id назначенного мастера")]
        public int? MasterId { get; set; }
        [Description("Город заявки")]
        public required string City { get; set; }
        [Description("Адрес заявки")]
        public required string Address { get; set; }
        [Description("Откуда пришла заявка")]
        public required int SourceId { get; set; }
        [Description("Описание проблемы")]
        public required string ProblemDescription { get; set; }
        [Description("Тип техники")]
        public required string EquipmentType { get; set; }
        [Description("Дата выезда на заявку")]
        public DateTime SheduledAt { get; set; }
        [Description("Статус заявки")]
        public required RequestStatus Status { get; set; } = RequestStatus.New;
    }
}
