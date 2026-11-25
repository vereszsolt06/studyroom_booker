using Microsoft.AspNetCore.Mvc;
using studyroom_booker.Dtos;
using studyroom_booker.Services;

namespace studyroom_booker.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController(IBookingService bookingService) : ControllerBase
{
    // GET /api/bookings?date=2026-11-26&roomId=3  (mindkét paraméter opcionális)
    [HttpGet]
    public async Task<List<BookingDto>> GetAll([FromQuery] DateOnly? date, [FromQuery] int? roomId) => await bookingService.GetAllAsync(date, roomId);

    // GET /api/bookings/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookingDto>> GetById(int id)
    {
        var booking = await bookingService.GetByIdAsync(id);
        if (booking == null)
        {
            return NotFound(new ApiError("Nincs ilyen foglalás."));
        }
        return booking;
    }
}