using Microsoft.AspNetCore.Mvc;
using studyroom_booker.Dtos;
using studyroom_booker.Services;

namespace studyroom_booker.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController(IBookingService bookingService) : ControllerBase
{
    // GET /api/bookings?date=2026-11-26&roomId=3
    [HttpGet]
    public async Task<List<BookingDto>> GetAll([FromQuery] DateOnly? date, [FromQuery] int? roomId) => await bookingService.GetAllAsync(date, roomId);

    // GET /api/bookings/5
    [HttpGet("{id:int}")]
    public async Task<BookingDto> GetById(int id) => await bookingService.GetByIdAsync(id);

    // POST /api/bookings -> 201 Created
    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create(BookingRequest request)
    {
        var booking = await bookingService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
    }

    // PUT /api/bookings/5
    [HttpPut("{id:int}")]
    public async Task<BookingDto> Update(int id, BookingRequest request) => await bookingService.UpdateAsync(id, request);

    // DELETE /api/bookings/5  → 204 No Content
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await bookingService.DeleteAsync(id);
        return NoContent();
    }
}