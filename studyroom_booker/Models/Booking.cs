namespace studyroom_booker.Models;

public class Booking
{
    public int Id { get; set; }

    public int RoomId { get; set; }
    public Room? Room { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public DateOnly Date { get; set; }
    public int StartHour { get; set; }
    public int EndHour { get; set; }
    public int PeopleCount { get; set; } = 1;
    public string? Note { get; set; }
}