using FluentValidation;
using FluentValidation.AspNetCore;
using ServiceCRM.Services.AnalyticsServices;
using ServiceCRM.Services.AuthServices;
using ServiceCRM.Services.ClientServices;
using ServiceCRM.Services.LeadSourceService;
using ServiceCRM.Services.MasterServices;
using ServiceCRM.Services.PaymentServices;
using ServiceCRM.Services.ServiceRequestServices;
using System.Reflection;

namespace ServiceCRM.Extensions
{
    public static class AppServicesExtensions
    {
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddScoped<IClientService, ClientService>();
            services.AddScoped<IMasterService, MasterService>();
            services.AddScoped<IServiceRequestService, ServiceRequestService>();
            services.AddScoped<ILeadSourceService, LeadSourceService>();
            services.AddScoped<IAnalyticsService, AnalyticsService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IAuthService, AuthService>();

            services.AddFluentValidationAutoValidation();
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = configuration.GetConnectionString("Redis");
                options.InstanceName = "ServiceCRM_";
            });

            return services;
        }
    }
}
