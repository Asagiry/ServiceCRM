using FluentValidation;
using ServiceCRM.Models.Request;

namespace ServiceCRM.DTOs.ServiceRequestDTOs
{
    public class UpdateStatusServiceRequestDto
    {
        public RequestStatus Status { get; set; }
    }

    public class StatusUpdateDtoValidator : AbstractValidator<UpdateStatusServiceRequestDto>
    {
        public StatusUpdateDtoValidator()
        {
            RuleFor(x => x.Status)
                .IsInEnum();
        }
    }
}
