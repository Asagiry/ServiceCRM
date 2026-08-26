namespace ServiceCRM.Extensions
{
    public static class CorsServiceExtensions
    {
        public static IServiceCollection AddFrontendCors(this IServiceCollection services)
        {
            services.AddCors(o => o.AddPolicy("Frontend", p =>
                p.WithOrigins("http://localhost:3000", "http://localhost:5173")
                 .AllowAnyHeader().AllowAnyMethod()));

            return services;
        }
    }
}
