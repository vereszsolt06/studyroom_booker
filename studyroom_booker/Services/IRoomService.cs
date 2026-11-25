using studyroom_booker.Dtos;

namespace studyroom_booker.Services;

public interface IRoomService
{
    Task<List<RoomDto>> GetAllAsync();
    Task<RoomDto?> GetByIdAsync(int id);
}