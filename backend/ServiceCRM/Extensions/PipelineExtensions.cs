using Microsoft.EntityFrameworkCore;
using ServiceCRM.Models.Auth;
using ServiceCRM.Middlewares;

namespace ServiceCRM.Extensions
{
    public static class PipelineExtensions
    {
        public static WebApplication UseAppPipeline(this WebApplication app)
        {
            app.UseMiddleware<ExceptionMiddleware>();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("Frontend");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            return app;
        }

        public static void SeedAdmin(this WebApplication app)
        {
            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

                // Автоматически применяем все миграции при старте контейнера
                context.Database.Migrate();

                if (!context.Users.Any())
                {
                    var adminUsername = config["Admin:Username"] ?? "admin";
                    var adminPassword = config["Admin:Password"] ?? "AdminPassword2026!";
                    var adminUser = new User
                    {
                        Username = adminUsername,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                        Role = "admin"
                    };
                    context.Users.Add(adminUser);
                    context.SaveChanges();
                }
            }
        }
    }
}
