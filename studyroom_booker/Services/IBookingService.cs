using studyroom_booker.Dtos;

namespace studyroom_booker.Services;

public interface IBookingService
{
    Task<List<BookingDto>> GetAllAsync(DateOnly? date, int? roomId);
    Task<BookingDto?> GetByIdAsync(int id);
}