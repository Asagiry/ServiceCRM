using ServiceCRM.Models;
using ServiceCRM.Models.Lead;
using ServiceCRM.DTOs.ServiceRequestDTOs;
using System.ComponentModel;
using System.Diagnostics.CodeAnalysis;

namespace ServiceCRM.Models.Request
{
    public class ServiceRequest
    {
        #region Nav
        public Client? Client { get; set; }
        public Master? Master { get; set; }
        public LeadSource? LeadSource { get; set; }
        #endregion Nav

        [Description("Id заявки")]
        public int Id { get; set; }

        [Description("Id клиента")]
        public int ClientId { get; set; }

        [Description("Id назначенного мастера")]
        public int? MasterId { get; set; }

        [Description("Город заявки")]
        public required string City { get; set; }

        [Description("Адрес заявки")]
        public required string Address { get; set; }

        [Description("Откуда пришла заявка")]
        public required int LeadSourceId { get; set; }

        [Description("Описание проблемы")]
        public required string ProblemDescription { get; set; }

        [Description("Тип техники")]
        public required string EquipmentType { get; set; }

        [Description("Дата выезда на заявку")]
        public DateTime? ScheduledAt { get; set; }

        [Description("Статус заявки")]
        public RequestStatus Status { get; set; } = RequestStatus.New;

        [Description("Сумма заявки")]
        public decimal TotalPrice { get; set; }

        [Description("Затраты на ремонт")]
        public decimal DirectExpenses { get; set; }

        [Description("Доля мастеру")]
        public decimal MasterPayout { get; set; }

        [Description("Дата создания заявки")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        public ServiceRequest() { }

        [SetsRequiredMembers]
        public ServiceRequest(CreateServiceRequestDto dto)
        {
            ClientId = dto.ClientId;
            City = dto.City;
            Address = dto.Address;
            LeadSourceId = dto.LeadSourceId;
            ProblemDescription = dto.ProblemDescription;
            EquipmentType = dto.EquipmentType;
            ScheduledAt = dto.ScheduledAt;
        }

        public void UpdateServiceRequest(UpdateServiceRequestDto dto)
        {
            ClientId = dto.ClientId;
            MasterId = dto.MasterId;
            City = dto.City;
            Address = dto.Address;
            LeadSourceId = dto.LeadSourceId;
            ProblemDescription = dto.ProblemDescription;
            EquipmentType = dto.EquipmentType;
            ScheduledAt = dto.ScheduledAt;
            Status = dto.Status;
        }

        public void CompleteServiceRequest(CompleteServiceRequestDto dto)
        {
            Status = RequestStatus.Completed;
            TotalPrice = dto.TotalPrice;
            DirectExpenses = dto.DirectExpenses;
            MasterPayout = dto.MasterPayout;
        }
    }
}
