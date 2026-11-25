using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using studyroom_booker.Dtos;
using studyroom_booker.Services;

namespace studyroom_booker.Controllers;

[ApiController]
[Route("api/rooms")]
[Authorize]
public class RoomsController(IRoomService roomService) : ControllerBase
{
    // GET /api/rooms
    [HttpGet]
    public async Task<List<RoomDto>> GetAll() => await roomService.GetAllAsync();

    // GET /api/rooms/3
    [HttpGet("{id:int}")]
    public async Task<RoomDto> GetById(int id) => await roomService.GetByIdAsync(id);
}