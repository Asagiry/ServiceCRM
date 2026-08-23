
using ServiceCRM.Models.Request;
using System.ComponentModel;

namespace ServiceCRM.DTOs.ServiceRequestDTOs
{
    public static class ServiceRequestMapping
    {
        public static ServiceRequestResponseDto ToDto(this ServiceRequest r) => new()
        {
            Id = r.Id,
            City = r.City,
            Address = r.Address,
            EquipmentType = r.EquipmentType,
            ProblemDescription = r.ProblemDescription,
            ScheduledAt = r.ScheduledAt,
            Status = r.Status,

            TotalPrice = r.TotalPrice,
            DirectExpenses = r.DirectExpenses,
            MasterPayout = r.MasterPayout,

            ClientId = r.ClientId,
            ClientFullName = r.Client?.FullName ?? "",
            ClientPhoneNumber = r.Client?.PhoneNumber ?? "",

            MasterId = r.MasterId,
            MasterFullName = r.Master?.Fullname,

            LeadSourceName = r.LeadSource?.Name ?? "",
            CreatedAt = r.CreatedAt
        };
    }
}
