using ServiceCRM.Models.Request;
using System.ComponentModel;

namespace ServiceCRM.DTOs.MasterDTOs
{
    public class MasterResponseDto
    {
        [Description("Id мастера")]
        public int Id { get; set; }
        [Description("Полное имя мастера")]
        public required string Fullname { get; set; }
        [Description("Номер телефона мастера")]
        public required string PhoneNumber { get; set; }
        [Description("Телеграм мастера")]
        public required string Telegram { get; set; }
        [Description("Город мастера")]
        public required string City { get; set; }
        [Description("Специализация мастера")]
        public required List<string> Specialization { get; set; }
        [Description("Комиссия мастеру")]
        public decimal CommissionPercent { get; set; }
        [Description("Активен ли мастер(мб отпуск,больничный, отдыхает")]
        public bool IsActive { get; set; }
    }
}
