namespace studyroom_booker.Dtos;

public record BookingRequest(int RoomId, int UserId, DateOnly Date, int StartHour, int EndHour, int PeopleCount = 1, string? Note = null);