using Microsoft.EntityFrameworkCore;
using studyroom_booker.Data;
using studyroom_booker.Dtos;

namespace studyroom_booker.Services;

public class BookingService(AppDbContext db) : IBookingService
{
    public async Task<List<BookingDto>> GetAllAsync(DateOnly? date, int? roomId)
    {
        var query = db.Bookings.Include(b => b.Room).Include(b => b.User).AsQueryable();

        if (date != null) query = query.Where(b => b.Date == date);
        if (roomId != null) query = query.Where(b => b.RoomId == roomId);

        var bookings = await query.OrderBy(b => b.Date).ThenBy(b => b.StartHour).ToListAsync();
        return bookings.Select(BookingDto.From).ToList();
    }

    public async Task<BookingDto?> GetByIdAsync(int id)
    {
        var booking = await db.Bookings
            .Include(b => b.Room)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id);

        if(booking != null)
        {
            return BookingDto.From(booking);
        }

        return null;
    }
}