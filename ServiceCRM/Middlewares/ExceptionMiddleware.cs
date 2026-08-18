using System.Net;

namespace ServiceCRM.Middlewares
{
    public class ExceptionMiddleware
    {
        RequestDelegate _next;
        ILogger<ExceptionMiddleware> _logger;
        IHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, $"Произошла ошибка, {ex.Message}");

                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.ContentType = "application/json";

                var response = new
                {
                    message = "Внутренняя ошибка сервера, попробуйте позже.",
                    error = ex.Message,
                    stackTrace = _env.IsDevelopment() ? ex.StackTrace : null
                };

                await context.Response.WriteAsJsonAsync(response);
            }
        }

    }
}
