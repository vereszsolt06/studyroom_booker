using studyroom_booker.Models;

namespace studyroom_booker.Dtos;

public record BookingDto(int Id, int RoomId, string RoomName, int UserId, string StudentName, DateOnly Date, int StartHour, int EndHour, int PeopleCount, string? Note)
{
    public static BookingDto From(Booking b) => new(b.Id, b.RoomId, b.Room?.Name ?? "", b.UserId, b.User?.Name ?? "", b.Date, b.StartHour, b.EndHour, b.PeopleCount, b.Note);
}