using studyroom_booker.Dtos;
using studyroom_booker.Models;

namespace studyroom_booker.Services;

// A foglalási szabályok egy helyen, "tiszta" függvényekként (nem nyúlnak az adatbázishoz) → könnyen tesztelhetők
public static class BookingRules
{
    public const int OpeningHour = 8;
    public const int ClosingHour = 20;
    public const int MaxHours = 3;
    public const int MaxDaysAhead = 30;

    public static bool Overlaps(int startA, int endA, int startB, int endB) => startA < endB && endA > startB;

    public static string? Validate(BookingRequest request, Room room, DateTime now)
    {
        if (request.EndHour <= request.StartHour)
            return "A foglalás vége a kezdete után kell legyen.";

        if (request.StartHour < OpeningHour || request.EndHour > ClosingHour)
            return $"A tanulószobák {OpeningHour}:00 és {ClosingHour}:00 között foglalhatók.";

        if (request.EndHour - request.StartHour > MaxHours)
            return $"Egyszerre legfeljebb {MaxHours} órára lehet foglalni.";

        if (request.PeopleCount < 1)
            return "A létszám legalább 1 fő.";

        if (request.PeopleCount > room.Capacity)
            return $"A(z) {room.Name} legfeljebb {room.Capacity} fős.";

        var today = DateOnly.FromDateTime(now);
        if (request.Date < today || (request.Date == today && request.StartHour <= now.Hour))
            return "Múltbeli időpontra nem lehet foglalni.";

        if (request.Date > today.AddDays(MaxDaysAhead))
            return $"Legfeljebb {MaxDaysAhead} nappal előre lehet foglalni.";

        return null;
    }
}