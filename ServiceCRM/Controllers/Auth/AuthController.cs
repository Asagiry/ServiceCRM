using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServiceCRM.DTOs.AuthDTOs;
using ServiceCRM.Services.AuthServices;
using System.ComponentModel;

namespace ServiceCRM.Controllers.Auth
{
    [ApiController]
    [AllowAnonymous]
    [Route("api/auth")]
    public class AuthController: ControllerBase
    {

        IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [EndpointSummary("Авторизация по логину и паролю")]
        public async Task<ActionResult<LoginResponseDto>> Login(
            [FromBody][Description("")]LoginDto dto,
            CancellationToken ct)
        {
            return Ok(await _authService.LoginAsync(dto, ct));
        }
    }
}
