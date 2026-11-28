namespace studyroom_booker.Dtos;

public record RoomStatDto(int RoomId, string Name, int Bookings, int Hours, double Utilization);

public record HourStatDto(int Hour, int Count);

public record DayStatDto(string Day, int Count);

public record StudentStatDto(string Name, int Bookings, int Hours);

public record StatsDto(
    DateOnly? From,
    DateOnly? To,
    int TotalBookings,
    int TotalHours,
    double AverageLength,
    int UniqueStudents,
    string? BusiestRoom,
    int? BusiestHour,
    List<RoomStatDto> Rooms,
    List<HourStatDto> Hourly,
    List<DayStatDto> Weekdays,
    int[][] Heatmap,
    List<StudentStatDto> TopStudents);
