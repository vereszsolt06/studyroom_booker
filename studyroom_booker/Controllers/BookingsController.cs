using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using studyroom_booker.Dtos;
using studyroom_booker.Services;

namespace studyroom_booker.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingsController(IBookingService bookingService) : ControllerBase
{
    // GET /api/bookings?date=2026-11-26&from=2026-11-25&roomId=3&mine=true
    [HttpGet]
    public async Task<List<BookingDto>> GetAll([FromQuery] DateOnly? date, [FromQuery] DateOnly? from, [FromQuery] int? roomId, [FromQuery] bool mine = false) => await bookingService.GetAllAsync(date, from, roomId, mine);

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