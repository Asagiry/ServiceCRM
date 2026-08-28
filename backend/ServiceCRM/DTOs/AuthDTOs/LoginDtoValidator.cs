using FluentValidation;

namespace ServiceCRM.DTOs.AuthDTOs
{
    public class LoginDtoValidator : AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty()
                .Length(3, 30);

            RuleFor(x => x.Password)
                .NotEmpty()
                .Length(6, 50);
        }
    }
}
