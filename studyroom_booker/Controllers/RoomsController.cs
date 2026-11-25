using Microsoft.AspNetCore.Mvc;
using studyroom_booker.Dtos;
using studyroom_booker.Services;

namespace studyroom_booker.Controllers;

[ApiController]
[Route("api/rooms")]
public class RoomsController(IRoomService roomService) : ControllerBase
{
    // GET /api/rooms
    [HttpGet]
    public async Task<List<RoomDto>> GetAll() => await roomService.GetAllAsync();

    // GET /api/rooms/3
    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoomDto>> GetById(int id)
    {
        var room = await roomService.GetByIdAsync(id);
        if (room == null)
        {
            return NotFound(new ApiError("Nincs ilyen terem."));
        }
        return room;
    }
}