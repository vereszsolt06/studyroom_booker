using studyroom_booker.Models;

namespace studyroom_booker.Dtos;

public record UserDto(int Id, string NeptunCode, string Name, bool IsAdmin)
{
    public static UserDto From(User user) => new(user.Id, user.NeptunCode, user.Name, user.IsAdmin);
}