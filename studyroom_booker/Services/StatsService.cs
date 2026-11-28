using Microsoft.EntityFrameworkCore;
using studyroom_booker.Data;
using studyroom_booker.Dtos;
using studyroom_booker.Models;

namespace studyroom_booker.Services;

public class StatsService(AppDbContext db) : IStatsService
{
    private static readonly string[] DayNames = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
    private const int HoursPerDay = BookingRules.ClosingHour - BookingRules.OpeningHour;

    public async Task<StatsDto> GetStatsAsync(DateOnly? from, DateOnly? to)
    {
        var query = db.Bookings.Include(b => b.User).AsQueryable();

        if (from != null)
        {
            query = query.Where(b => b.Date >= from);
        }

        if (to != null)
        {
            query = query.Where(b => b.Date <= to);
        }

        var bookings = await query.ToListAsync();
        var rooms = await db.Rooms.ToListAsync();

        var periodFrom = from ?? (bookings.Count == 0 ? null : bookings.Min(b => b.Date));
        var periodTo = to ?? (bookings.Count == 0 ? null : bookings.Max(b => b.Date));
        var days = periodFrom == null || periodTo == null ? 0 : periodTo.Value.DayNumber - periodFrom.Value.DayNumber + 1;

        var totalHours = bookings.Sum(Hours);
        var averageLength = bookings.Count == 0 ? 0 : Math.Round((double)totalHours / bookings.Count, 1, MidpointRounding.AwayFromZero);

        var roomStats = rooms
            .Select(r => ToRoomStat(r, bookings.Where(b => b.RoomId == r.Id).ToList(), days))
            .OrderByDescending(r => r.Hours)
            .ThenBy(r => r.Name)
            .ToList();

        var hourly = Enumerable.Range(BookingRules.OpeningHour, HoursPerDay)
            .Select(hour => new HourStatDto(hour, bookings.Count(b => b.StartHour <= hour && b.EndHour > hour)))
            .ToList();

        var weekdays = Enumerable.Range(0, DayNames.Length)
            .Select(day => new DayStatDto(DayNames[day], bookings.Count(b => DayIndex(b.Date) == day)))
            .ToList();

        var heatmap = Enumerable.Range(0, DayNames.Length).Select(_ => new int[HoursPerDay]).ToArray();

        foreach (var booking in bookings)
        {
            for (var hour = booking.StartHour; hour < booking.EndHour; hour++)
            {
                heatmap[DayIndex(booking.Date)][hour - BookingRules.OpeningHour]++;
            }
        }

        var topStudents = bookings
            .GroupBy(b => b.UserId)
            .Select(g => new StudentStatDto(g.First().User?.Name ?? "", g.Count(), g.Sum(Hours)))
            .OrderByDescending(s => s.Hours)
            .ThenBy(s => s.Name)
            .Take(5)
            .ToList();

        return new StatsDto(
            periodFrom,
            periodTo,
            bookings.Count,
            totalHours,
            averageLength,
            bookings.Select(b => b.UserId).Distinct().Count(),
            bookings.Count == 0 ? null : roomStats.First().Name,
            bookings.Count == 0 ? null : hourly.MaxBy(h => h.Count)!.Hour,
            roomStats,
            hourly,
            weekdays,
            heatmap,
            topStudents);
    }

    private static int Hours(Booking booking) => booking.EndHour - booking.StartHour;

    private static int DayIndex(DateOnly date) => ((int)date.DayOfWeek + 6) % 7;

    private static RoomStatDto ToRoomStat(Room room, List<Booking> roomBookings, int days)
    {
        var hours = roomBookings.Sum(Hours);
        var utilization = days == 0 ? 0 : Math.Round((double)hours / (days * HoursPerDay) * 100, 1, MidpointRounding.AwayFromZero);
        return new RoomStatDto(room.Id, room.Name, roomBookings.Count, hours, utilization);
    }
}
