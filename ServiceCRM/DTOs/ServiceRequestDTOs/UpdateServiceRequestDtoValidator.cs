using FluentValidation;
using ServiceCRM.Class;
using System.ComponentModel;

namespace ServiceCRM.DTOs.ServiceRequestDTOs
{
    public class UpdateServiceRequestDtoValidator : AbstractValidator<UpdateServiceRequestDto>
    {
        public UpdateServiceRequestDtoValidator()
        {
            RuleFor(x => x.MasterId)
                .GreaterThan(0)
                .WithMessage("Необходимо указать корректный Id мастера.");

            RuleFor(x => x.ClientId)
                .GreaterThan(0)
                .WithMessage("Необходимо указать корректный Id клиента.");

            RuleFor(x => x.City)
               .NotEmpty()
               .Length(2, 25);

            RuleFor(x => x.Address)
                .NotEmpty()
                .Length(5, 100);

            RuleFor(x => x.Source)
               .NotEmpty()
               .Length(0, 20);

            RuleFor(x => x.ProblemDescription)
               .NotEmpty()
               .Length(0, 25);

            RuleFor(x => x.EquipmentType)
                .NotEmpty()
                .Length(0, 25);

            RuleFor(x => x.Status)
                .IsInEnum()
                .WithMessage("Неизвестный статус.");

        }
    }
}
