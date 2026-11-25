using studyroom_booker.Models;

namespace studyroom_booker.Dtos;

public record BookingDto(int Id, int RoomId, string RoomName, int UserId, string StudentName, string? NeptunCode, DateOnly Date, int StartHour, int EndHour, int PeopleCount, string? Note, bool CanEdit)
{
    public static BookingDto From(Booking b, bool canEdit) => new(b.Id, b.RoomId, b.Room?.Name ?? "", b.UserId, b.User?.Name ?? "", canEdit ? b.User?.NeptunCode : null, b.Date, b.StartHour, b.EndHour, b.PeopleCount, b.Note, canEdit);
}