using FluentValidation;
using System.ComponentModel;

namespace ServiceCRM.DTOs.ClientDTOs
{
    public class CreateClientDtoValidator : AbstractValidator<CreateClientDto>
    {
        public CreateClientDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty()
                .Length(10, 100);

            RuleFor(x => x.PhoneNumber)
                .NotEmpty()
                .Matches(@"^\+7\d{10}$")
                .WithMessage("Номер телефона должен начинаться с +7 и содержать ровно 11 цифр без пробелов.");

            RuleFor(x => x.City)
                .NotEmpty()
                .Length(2, 25);
        }
    }
}

