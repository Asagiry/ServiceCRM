using ServiceCRM.Class;
using System.ComponentModel;

namespace ServiceCRM.DTOs.ClientDTOs
{
    public class CreateClientDto
    {
        [Description("Полное имя клиента")]
        public required string FullName { get; set; }

        [Description("Номер телефона клиента")]
        public required string PhoneNumber { get; set; }

        [Description("Город проживания клиента")]
        public required string City { get; set; }
   
    }
}
