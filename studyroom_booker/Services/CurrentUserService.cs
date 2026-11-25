using System.Security.Claims;
using studyroom_booker.Extensions;

namespace studyroom_booker.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal User => httpContextAccessor.HttpContext?.User ?? new ClaimsPrincipal();

    public int UserId => User.GetUserId();
    public bool IsAdmin => User.IsAdmin();
}