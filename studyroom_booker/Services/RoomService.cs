using Microsoft.EntityFrameworkCore;
using studyroom_booker.Data;
using studyroom_booker.Dtos;
using studyroom_booker.Exceptions;

namespace studyroom_booker.Services;

public class RoomService(AppDbContext db) : IRoomService
{
    public async Task<List<RoomDto>> GetAllAsync()
    {
        var rooms = await db.Rooms.OrderBy(r => r.Id).ToListAsync();
        return rooms.Select(RoomDto.From).ToList();
    }

    public async Task<RoomDto> GetByIdAsync(int id)
    {
        var room = await db.Rooms.FindAsync(id);

        if(room == null)
        {
            throw new NotFoundException($"Nincs ilyen terem");
        }

        return RoomDto.From(room);
    }
}