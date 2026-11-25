using studyroom_booker.Dtos;

namespace studyroom_booker.Services;

public interface IAuthService
{
    Task<UserDto> LoginAsync(LoginRequest request);
    Task<UserDto> RegisterAsync(RegisterRequest request);
    Task<UserDto> GetByIdAsync(int id);
}