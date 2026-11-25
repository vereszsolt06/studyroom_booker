using studyroom_booker.Dtos;

namespace studyroom_booker.Services;

public interface IBookingService
{
    Task<List<BookingDto>> GetAllAsync(DateOnly? date, DateOnly? from, int? roomId, bool mine);
    Task<BookingDto> GetByIdAsync(int id);
    Task<BookingDto> CreateAsync(BookingRequest request);
    Task<BookingDto> UpdateAsync(int id, BookingRequest request);
    Task DeleteAsync(int id);
}