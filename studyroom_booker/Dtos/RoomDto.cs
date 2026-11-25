using studyroom_booker.Models;

namespace studyroom_booker.Dtos;

public record RoomDto(int Id, string Name, int Capacity, string Equipment)
{
    public static RoomDto From(Room room) => new(room.Id, room.Name, room.Capacity, room.Equipment);
}