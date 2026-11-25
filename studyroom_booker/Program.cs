using Microsoft.EntityFrameworkCore;
using studyroom_booker.Data;
using studyroom_booker.Services;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

// Controllers
builder.Services.AddControllers();

// Services
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IBookingService, BookingService>();

var app = builder.Build();

// Database initialization and seeding
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    SeedData.Seed(db);
}

app.MapControllers();

app.Run();