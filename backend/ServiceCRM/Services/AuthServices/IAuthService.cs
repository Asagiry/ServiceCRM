using ServiceCRM.DTOs.AuthDTOs;

namespace ServiceCRM.Services.AuthServices
{
    public interface IAuthService
    {
        public Task<LoginResponseDto> LoginAsync(
            LoginDto dto, 
            CancellationToken ct);
    }
}
