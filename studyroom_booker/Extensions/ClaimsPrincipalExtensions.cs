using System.Security.Claims;

namespace studyroom_booker.Extensions;

public static class ClaimsPrincipalExtensions
{
    public const string AdminRole = "Admin";

    public static int GetUserId(this ClaimsPrincipal principal) => int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    public static bool IsAdmin(this ClaimsPrincipal principal) => principal.IsInRole(AdminRole);
}