using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using studyroom_booker.Dtos;
using studyroom_booker.Extensions;
using studyroom_booker.Services;

namespace studyroom_booker.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    // POST /api/auth/login → 200 + felhasználó, és beállítja a cookie-t
    [HttpPost("login")]
    public async Task<UserDto> Login(LoginRequest request)
    {
        var user = await authService.LoginAsync(request);
        await SignInAsync(user);
        return user;
    }

    // POST /api/auth/register → 201, és egyből be is lépteti
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterRequest request)
    {
        var user = await authService.RegisterAsync(request);
        await SignInAsync(user);
        return CreatedAtAction(nameof(Me), user);
    }

    // POST /api/auth/logout -> 204 deletes cookies
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    // GET /api/auth/me whoami
    [Authorize]
    [HttpGet("me")]
    public async Task<UserDto> Me() => await authService.GetByIdAsync(User.GetUserId());

    private Task SignInAsync(UserDto user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Name),
        };
        if (user.IsAdmin)
        {
            claims.Add(new Claim(ClaimTypes.Role, ClaimsPrincipalExtensions.AdminRole));
        }

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        return HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
    }
}