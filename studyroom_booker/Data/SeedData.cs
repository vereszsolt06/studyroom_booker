using Microsoft.AspNetCore.Identity;
using studyroom_booker.Models;

namespace studyroom_booker.Data;

public static class SeedData
{
    public static void Seed(AppDbContext db)
    {
        if (db.Rooms.Any()) return;

        var hasher = new PasswordHasher<User>();

        var admin = new User { NeptunCode = "ADMIN1", Name = "Admin", IsAdmin = true };
        admin.PasswordHash = hasher.HashPassword(admin, "admin123");
        var anna = new User { NeptunCode = "ABC123", Name = "Kiss Anna" };
        anna.PasswordHash = hasher.HashPassword(anna, "jelszo123");
        var bence = new User { NeptunCode = "DEF456", Name = "Nagy Bence" };
        bence.PasswordHash = hasher.HashPassword(bence, "jelszo123");

        db.Users.AddRange(admin, anna, bence);

        var rooms = new List<Room>
        {
            new() { Name = "Csendes fülke 1", Capacity = 1, Equipment = "asztali lámpa" },
            new() { Name = "Csendes fülke 2", Capacity = 1, Equipment = "asztali lámpa" },
            new() { Name = "Csoportszoba A", Capacity = 4, Equipment = "tábla" },
            new() { Name = "Csoportszoba B", Capacity = 6, Equipment = "tábla, TV" },
            new() { Name = "Számítógépes terem", Capacity = 8, Equipment = "8 PC, projektor" },
            new() { Name = "Nagy tanulóterem", Capacity = 12, Equipment = "projektor, tábla" },
        };
        db.Rooms.AddRange(rooms);

        var today = DateOnly.FromDateTime(DateTime.Today);
        db.Bookings.AddRange(
            new Booking { Room = rooms[2], User = anna, Date = today, StartHour = 10, EndHour = 12, PeopleCount = 3, Note = "Matek ZH" },
            new Booking { Room = rooms[2], User = bence, Date = today, StartHour = 14, EndHour = 16, PeopleCount = 2 },
            new Booking { Room = rooms[0], User = anna, Date = today.AddDays(1), StartHour = 9, EndHour = 11 },
            new Booking { Room = rooms[5], User = bence, Date = today.AddDays(1), StartHour = 16, EndHour = 19, PeopleCount = 8, Note = "Csoportos tanulás" }
        );

        db.SaveChanges();
    }
}