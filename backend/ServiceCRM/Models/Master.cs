using ServiceCRM.DTOs.MasterDTOs;
using ServiceCRM.Models.Request;
using System.ComponentModel;
using System.Diagnostics.CodeAnalysis;

namespace ServiceCRM.Models
{
    public class Master
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
        [Description("Список всех заявок")]
        public List<ServiceRequest> Requests { get; set; } = new List<ServiceRequest>();
        [Description("Комиссия мастеру")]
        public decimal CommissionPercent { get; set; }
        [Description("Активен ли мастер(мб отпуск,больничный, отдыхает")]
        public bool IsActive { get; set; }

        public Master() { }

        [SetsRequiredMembers]
        public Master(CreateMasterDto dto)
        {
            Fullname = dto.Fullname;
            PhoneNumber = dto.PhoneNumber;
            City = dto.City;
            Telegram = dto.Telegram;
            Specialization = dto.Specialization;
            CommissionPercent = dto.CommissionPercent;
            IsActive = dto.IsActive;
        }

        public void UpdateFromDto(UpdateMasterDto dto)
        {
            Fullname = dto.Fullname;
            PhoneNumber = dto.PhoneNumber;
            City = dto.City;
            Telegram = dto.Telegram;
            Specialization = dto.Specialization;
            CommissionPercent = dto.CommissionPercent;
            IsActive = dto.IsActive;
        }
    }
}
