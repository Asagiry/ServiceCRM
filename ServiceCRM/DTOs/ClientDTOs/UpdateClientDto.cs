using ServiceCRM.Models;
using System.ComponentModel;

namespace ServiceCRM.DTOs.ClientDTOs
{
    public class UpdateClientDto
    {
        [Description("Полное имя клиента")]
        public required string FullName { get; set; }

        [Description("Номер телефона клиента")]
        public required string PhoneNumber { get; set; }

        [Description("Город проживания клиента")]
        public required string City { get; set; }
    }
}
