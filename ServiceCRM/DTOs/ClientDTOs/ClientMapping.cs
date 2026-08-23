using ServiceCRM.DTOs.ServiceRequestDTOs;
using ServiceCRM.Models;

namespace ServiceCRM.DTOs.ClientDTOs
{
    public static class ClientMapping
    {
        public static ClientResponseDto ToDto(this Client c) => new()
        {
            Id = c.Id,
            FullName = c.FullName,
            PhoneNumber = c.PhoneNumber,
            City = c.City,
            CreatedAt = c.CreatedAt
        };

        public static ClientDetailedResponseDto ToDetailedDto(this Client c) => new()
        {
            Id = c.Id,
            FullName = c.FullName,
            PhoneNumber = c.PhoneNumber,
            City = c.City,
            CreatedAt = c.CreatedAt,
            Requests = c.Requests.Select(r => r.ToDto()).ToList()
        };
    }
}
