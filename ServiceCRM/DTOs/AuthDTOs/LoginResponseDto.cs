namespace ServiceCRM.DTOs.AuthDTOs
{
    public class LoginResponseDto
    {
        public required string Token { get; set; }
        public required DateTime ExpiresAt { get; set; }
        public required string Role { get; set; }
        public required string Username { get; set; }
    }
}
