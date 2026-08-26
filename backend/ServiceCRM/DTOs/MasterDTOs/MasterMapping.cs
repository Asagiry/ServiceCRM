using ServiceCRM.DTOs.ServiceRequestDTOs;
using ServiceCRM.Models;
using System.ComponentModel;

namespace ServiceCRM.DTOs.MasterDTOs
{
    public static class MasterMapping
    {
        public static MasterResponseDto ToDto(this Master m) => new()
        {
            Id = m.Id,
            Fullname = m.Fullname,
            PhoneNumber = m.PhoneNumber,
            Telegram = m.Telegram,
            City = m.City,
            Specialization = m.Specialization,
            CommissionPercent = m.CommissionPercent,
            IsActive = m.IsActive
        };

        public static MasterDetailedResponseDto ToDetailedDto(this Master m) => new()
        {
            Id = m.Id,
            Fullname = m.Fullname,
            PhoneNumber = m.PhoneNumber,
            Telegram = m.Telegram,
            City = m.City,
            Specialization = m.Specialization,
            CommissionPercent = m.CommissionPercent,
            IsActive = m.IsActive,
            Requests = m.Requests.Select(r => r.ToDto()).ToList()
        };
    }
}