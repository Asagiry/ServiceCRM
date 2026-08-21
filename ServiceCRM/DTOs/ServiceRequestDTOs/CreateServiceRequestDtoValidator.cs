using FluentValidation;
using System.ComponentModel;

namespace ServiceCRM.DTOs.ServiceRequestDTOs
{
    public class CreateServiceRequestDtoValidator : AbstractValidator<CreateServiceRequestDto>
    {
        public CreateServiceRequestDtoValidator()
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

            RuleFor(x => x.SourceId)
                .GreaterThan(0)
                .WithMessage("Необходимо указать корректный Id источника.");

            RuleFor(x => x.ProblemDescription)
               .NotEmpty()
               .Length(0, 500);

            RuleFor(x => x.EquipmentType)
                .NotEmpty()
                .Length(0, 25);


        }
    }
}
