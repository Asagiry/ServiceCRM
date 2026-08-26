using FluentValidation;

namespace ServiceCRM.DTOs.AuthDTOs
{
    public class LoginDtoValidator : AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty()
                .Length(6, 20);

            RuleFor(x => x.Password)
                .NotEmpty()
                .Length(10, 20);
        }
    }
}
