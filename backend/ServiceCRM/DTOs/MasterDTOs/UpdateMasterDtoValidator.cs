using FluentValidation;

namespace ServiceCRM.DTOs.MasterDTOs
{
    public class UpdateMasterDtoValidator : AbstractValidator<UpdateMasterDto>
    {
        public UpdateMasterDtoValidator()
        {
            RuleFor(x => x.Fullname)
               .Length(3, 100)
               .WithMessage("Фио должно быть от 3 до 100 символов");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty()
                .Matches(@"^\+7\d{10}$")
                .WithMessage("Номер телефона должен начинаться с +7 и содержать ровно 11 цифр без пробелов.");

            RuleFor(x => x.City)
                .NotEmpty()
                .Length(2, 25);

            RuleFor(x => x.Telegram)
                .NotEmpty()
                .Must(x => x.StartsWith("@"))
                .WithMessage("Ник в Telegram должен начинаться с символа @.");

            RuleFor(x => x.Specialization)
                .NotEmpty()
                .WithMessage("Список специализаций не может быть пустым. Укажите хотя бы одну.");

            RuleFor(x => x.CommissionPercent)
                .NotEmpty()
                .InclusiveBetween(0, 100)
                .WithMessage("Процент должен быть от 0 до 100");
        }
    }
}
