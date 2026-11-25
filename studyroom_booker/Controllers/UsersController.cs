using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using studyroom_booker.Dtos;
using studyroom_booker.Extensions;
using studyroom_booker.Services;

namespace studyroom_booker.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = ClaimsPrincipalExtensions.AdminRole)]
public class UsersController(IUserService userService) : ControllerBase
{
    // GET /api/users
    [HttpGet]
    public async Task<List<UserDto>> GetAll() => await userService.GetAllAsync();
}