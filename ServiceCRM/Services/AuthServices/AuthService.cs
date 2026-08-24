using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ServiceCRM.Common;
using ServiceCRM.DTOs.AuthDTOs;
using ServiceCRM.Exceptions;
using ServiceCRM.Models.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ServiceCRM.Services.AuthServices
{
    public class AuthService: IAuthService
    {
        AppDbContext _context;
        IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto> LoginAsync(
            LoginDto dto,
            CancellationToken ct)
        {
            User user = await _context.Users.FirstOrDefaultAsync(x => x.Username == dto.Username, ct)
                ?? throw new UnauthorizedException(ErrorMessages.AuthorizationFailed());

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new UnauthorizedException(ErrorMessages.AuthorizationFailed());

            string jwtToken = GenerateJwtToken(user);

            var expireHours = int.Parse(_configuration["Jwt:ExpireHours"] ?? "8");

            return new LoginResponseDto
            {
                Token = jwtToken,
                ExpiresAt = DateTime.UtcNow.AddHours(expireHours),
                Role = user.Role,
                Username = user.Username
            };

        }

        private string GenerateJwtToken(
            User user)
        {
            var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                };

            var jwtKey = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT Secret Key не настроен в конфигурации!");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
   
            var expireHours = int.Parse(_configuration["Jwt:ExpireHours"] ?? "8");
            var expiresAt = DateTime.UtcNow.AddHours(expireHours);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "ServiceCRM",
                audience: _configuration["Jwt:Audience"] ?? "ServiceCRM",
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
