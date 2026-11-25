using studyroom_booker.Dtos;

namespace studyroom_booker.Services;

public interface IUserService
{
    Task<List<UserDto>> GetAllAsync();
}