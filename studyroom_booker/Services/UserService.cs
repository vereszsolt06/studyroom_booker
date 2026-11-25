using Microsoft.EntityFrameworkCore;
using studyroom_booker.Data;
using studyroom_booker.Dtos;

namespace studyroom_booker.Services;

public class UserService(AppDbContext db) : IUserService
{
    public async Task<List<UserDto>> GetAllAsync()
    {
        var users = await db.Users.OrderBy(u => u.Name).ToListAsync();
        return users.Select(UserDto.From).ToList();
    }
}