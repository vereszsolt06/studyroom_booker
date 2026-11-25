using Microsoft.EntityFrameworkCore;
using studyroom_booker.Data;
using studyroom_booker.Dtos;
using studyroom_booker.Exceptions;
using studyroom_booker.Models;

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

    public async Task<BookingDto> GetByIdAsync(int id)
    {
        var booking = await db.Bookings
            .Include(b => b.Room)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null)
        {
            throw new NotFoundException($"Nincs ilyen foglalás");
        }

        return BookingDto.From(booking);
    }

    public async Task<BookingDto> CreateAsync(BookingRequest request)
    {
        var (room, user) = await ValidateAsync(request, ignoreBookingId: null);

        var booking = new Booking
        {
            Room = room,
            User = user,
            Date = request.Date,
            StartHour = request.StartHour,
            EndHour = request.EndHour,
            PeopleCount = request.PeopleCount,
            Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim(),
        };

        db.Bookings.Add(booking);
        await db.SaveChangesAsync();
        return BookingDto.From(booking);
    }

    public async Task<BookingDto> UpdateAsync(int id, BookingRequest request)
    {
        var booking = await db.Bookings.FindAsync(id) ?? throw new NotFoundException("Nincs ilyen foglalás.");

        var (room, user) = await ValidateAsync(request, ignoreBookingId: id);

        booking.Room = room;
        booking.User = user;
        booking.Date = request.Date;
        booking.StartHour = request.StartHour;
        booking.EndHour = request.EndHour;
        booking.PeopleCount = request.PeopleCount;
        booking.Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim();

        await db.SaveChangesAsync();
        return BookingDto.From(booking);
    }

    public async Task DeleteAsync(int id)
    {
        var booking = await db.Bookings.FindAsync(id) ?? throw new NotFoundException("Nincs ilyen foglalás.");
        db.Bookings.Remove(booking);
        await db.SaveChangesAsync();
    }

    private async Task<(Room Room, User User)> ValidateAsync(BookingRequest request, int? ignoreBookingId)
    {
        var room = await db.Rooms.FindAsync(request.RoomId) ?? throw new BadRequestException("Nincs ilyen terem.");
        var user = await db.Users.FindAsync(request.UserId) ?? throw new BadRequestException("Nincs ilyen felhasználó.");

        var error = BookingRules.Validate(request, room, DateTime.Now);
        if (error != null)
        {
            throw new BadRequestException(error);
        }

        var sameDay = await db.Bookings
            .Include(b => b.Room)
            .Where(b => b.Date == request.Date && b.Id != ignoreBookingId)
            .ToListAsync();

        foreach (var other in sameDay)
        {
            if (!BookingRules.Overlaps(request.StartHour, request.EndHour, other.StartHour, other.EndHour))
            {
                continue;
            }

            if (other.RoomId == request.RoomId)
            {
                throw new ConflictException($"Ütközés! Ez a terem {other.StartHour}:00–{other.EndHour}:00 között már foglalt.");
            }

            if (other.UserId == request.UserId)
            {
                throw new ConflictException($"Ebben az időben már van foglalás erre a felhasználóra: {other.Room?.Name}, {other.StartHour}:00–{other.EndHour}:00.");
            }
        }

        return (room, user);
    }
}