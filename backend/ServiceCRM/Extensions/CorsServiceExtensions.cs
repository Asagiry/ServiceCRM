namespace ServiceCRM.Extensions
{
    public static class CorsServiceExtensions
    {
        public static IServiceCollection AddFrontendCors(this IServiceCollection services)
        {
            services.AddCors(o => o.AddPolicy("Frontend", p =>
                p.SetIsOriginAllowed(_ => true)
                 .AllowAnyHeader()
                 .AllowAnyMethod()
                 .AllowCredentials()));

            return services;
        }
    }
}
