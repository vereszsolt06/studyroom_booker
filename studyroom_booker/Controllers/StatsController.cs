using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using studyroom_booker.Dtos;
using studyroom_booker.Services;

namespace studyroom_booker.Controllers;

[ApiController]
[Route("api/stats")]
[Authorize]
public class StatsController(IStatsService statsService) : ControllerBase
{
    // GET /api/stats?from=2026-11-01&to=2026-11-30
    [HttpGet]
    public async Task<StatsDto> Get([FromQuery] DateOnly? from, [FromQuery] DateOnly? to) => await statsService.GetStatsAsync(from, to);
}
