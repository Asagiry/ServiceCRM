using FluentValidation;
using System.ComponentModel;

namespace ServiceCRM.DTOs.ServiceRequestDTOs
{
    public class CompleteServiceRequestDtoValidator: AbstractValidator<CompleteServiceRequestDto>
    {
        public CompleteServiceRequestDtoValidator()
        {
            RuleFor(x => x.TotalPrice)
                .GreaterThanOrEqualTo(0)
                .LessThanOrEqualTo(1000000);

            RuleFor(x => x.DirectExpenses)
                .GreaterThanOrEqualTo(0)
                .LessThanOrEqualTo(1000000);
        }
    }
}