using ServiceCRM.DTOs.ServiceRequestDTOs;
using System.ComponentModel;

namespace ServiceCRM.DTOs.ClientDTOs
{
    public class ClientDetailedResponseDto
    {
        [Description("Id клиента")]
        public int Id { get; set; }

        [Description("Полное имя клиента")]
        public required string FullName { get; set; }

        [Description("Номер телефона клиента")]
        public required string PhoneNumber { get; set; }

        [Description("Город проживания клиента")]
        public required string City { get; set; }

        [Description("Дата создания клиента")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Description("Список всех заявок")]
        public List<ServiceRequestResponseDto> Requests { get; set; } = new List<ServiceRequestResponseDto>();
    }
}
