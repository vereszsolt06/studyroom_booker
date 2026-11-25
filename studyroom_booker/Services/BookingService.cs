using Microsoft.EntityFrameworkCore;
using studyroom_booker.Data;
using studyroom_booker.Dtos;
using studyroom_booker.Exceptions;
using studyroom_booker.Models;

namespace studyroom_booker.Services;

public class BookingService(AppDbContext db, ICurrentUserService currentUser) : IBookingService
{
    public async Task<List<BookingDto>> GetAllAsync(DateOnly? date, DateOnly? from, int? roomId, bool mine)
    {
        var userId = currentUser.UserId;
        var query = db.Bookings.Include(b => b.Room).Include(b => b.User).AsQueryable();

        if (date != null) query = query.Where(b => b.Date == date);
        if (from != null) query = query.Where(b => b.Date >= from);
        if (roomId != null) query = query.Where(b => b.RoomId == roomId);
        if (mine) query = query.Where(b => b.UserId == userId);

        var bookings = await query.OrderBy(b => b.Date).ThenBy(b => b.StartHour).ToListAsync();
        return bookings.Select(ToDto).ToList();
    }

    public async Task<BookingDto> GetByIdAsync(int id)
    {
        var booking = await db.Bookings
            .Include(b => b.Room)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id)
            ?? throw new NotFoundException("Nincs ilyen foglalás.");

        return ToDto(booking);
    }

    public async Task<BookingDto> CreateAsync(BookingRequest request)
    {
        var ownerId = currentUser.IsAdmin && request.UserId != null ? request.UserId.Value : currentUser.UserId;
        var (room, owner) = await ValidateAsync(request, ownerId, ignoreBookingId: null);

        var booking = new Booking
        {
            Room = room,
            User = owner,
            Date = request.Date,
            StartHour = request.StartHour,
            EndHour = request.EndHour,
            PeopleCount = request.PeopleCount,
            Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim(),
        };

        db.Bookings.Add(booking);
        await db.SaveChangesAsync();
        return ToDto(booking);
    }

    public async Task<BookingDto> UpdateAsync(int id, BookingRequest request)
    {
        var booking = await db.Bookings.FindAsync(id) ?? throw new NotFoundException("Nincs ilyen foglalás.");

        if (!BookingRules.CanModify(booking, currentUser.UserId, currentUser.IsAdmin))
        {
            throw new ForbiddenException("Csak a saját foglalásodat módosíthatod.");
        }

        var ownerId = currentUser.IsAdmin && request.UserId != null ? request.UserId.Value : booking.UserId;
        var (room, owner) = await ValidateAsync(request, ownerId, ignoreBookingId: id);

        booking.Room = room;
        booking.User = owner;
        booking.Date = request.Date;
        booking.StartHour = request.StartHour;
        booking.EndHour = request.EndHour;
        booking.PeopleCount = request.PeopleCount;
        booking.Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim();

        await db.SaveChangesAsync();
        return ToDto(booking);
    }

    public async Task DeleteAsync(int id)
    {
        var booking = await db.Bookings.FindAsync(id) ?? throw new NotFoundException("Nincs ilyen foglalás.");

        if (!BookingRules.CanModify(booking, currentUser.UserId, currentUser.IsAdmin))
        {
            throw new ForbiddenException("Csak a saját foglalásodat törölheted.");
        }

        db.Bookings.Remove(booking);
        await db.SaveChangesAsync();
    }

    private BookingDto ToDto(Booking booking) => BookingDto.From(booking, BookingRules.CanModify(booking, currentUser.UserId, currentUser.IsAdmin));

    private async Task<(Room Room, User Owner)> ValidateAsync(BookingRequest request, int ownerId, int? ignoreBookingId)
    {
        var room = await db.Rooms.FindAsync(request.RoomId) ?? throw new BadRequestException("Nincs ilyen terem.");
        var owner = await db.Users.FindAsync(ownerId) ?? throw new BadRequestException("Nincs ilyen felhasználó.");

        var error = BookingRules.Validate(request, room, DateTime.Now);
        if (error != null) throw new BadRequestException(error);

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

            if (other.UserId == ownerId)
            {
                throw new ConflictException($"Ebben az időben már van foglalás erre a felhasználóra: {other.Room?.Name}, {other.StartHour}:00–{other.EndHour}:00.");
            }
        }

        return (room, owner);
    }
}