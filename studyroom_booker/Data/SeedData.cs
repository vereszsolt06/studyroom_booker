using studyroom_booker.Models;

namespace studyroom_booker.Data;

public static class SeedData
{
    public static void Seed(AppDbContext db)
    {
        if (db.Rooms.Any()) return;

        db.Rooms.AddRange(
            new Room { Name = "Csendes fülke 1", Capacity = 1, Equipment = "asztali lámpa" },
            new Room { Name = "Csendes fülke 2", Capacity = 1, Equipment = "asztali lámpa" },
            new Room { Name = "Csoportszoba A", Capacity = 4, Equipment = "tábla" },
            new Room { Name = "Csoportszoba B", Capacity = 6, Equipment = "tábla, TV" },
            new Room { Name = "Számítógépes terem", Capacity = 8, Equipment = "8 PC, projektor" },
            new Room { Name = "Nagy tanulóterem", Capacity = 12, Equipment = "projektor, tábla" });

        db.SaveChanges();
    }
}