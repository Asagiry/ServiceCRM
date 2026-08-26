using FluentValidation;
using ServiceCRM.Models;
using System.ComponentModel;

namespace ServiceCRM.DTOs.ServiceRequestDTOs
{
    public class UpdateServiceRequestDtoValidator : AbstractValidator<UpdateServiceRequestDto>
    {
        public UpdateServiceRequestDtoValidator()
        {
            RuleFor(x => x.ClientId)
                .GreaterThan(0)
                .WithMessage("Необходимо указать корректный Id клиента.");

            RuleFor(x => x.City)
               .NotEmpty()
               .Length(2, 25);

            RuleFor(x => x.Address)
                .NotEmpty()
                .Length(5, 100);

            RuleFor(x => x.LeadSourceId)
               .GreaterThan(0)
               .WithMessage("Необходимо указать корректный Id источника.");

            RuleFor(x => x.ProblemDescription)
               .NotEmpty()
               .Length(0, 500);

            RuleFor(x => x.EquipmentType)
                .NotEmpty()
                .Length(0, 25);

            RuleFor(x => x.Status)
                .IsInEnum()
                .WithMessage("Неизвестный статус.");

        }
    }
}
