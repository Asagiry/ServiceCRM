using FluentValidation;

namespace ServiceCRM.DTOs.PaymentDTOs
{
    public class CreatePaymentDtoValidator : AbstractValidator<CreatePaymentDto>
    {
        public CreatePaymentDtoValidator() {

            RuleFor(x => x.Amount)
                .GreaterThan(0);


            RuleFor(x => x.PaymentMethod)
                .IsInEnum()
                .WithMessage("Неизвестный статус оплаты.");

        }
    }
}
