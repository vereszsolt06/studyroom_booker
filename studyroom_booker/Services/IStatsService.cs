using studyroom_booker.Dtos;

namespace studyroom_booker.Services;

public interface IStatsService
{
    Task<StatsDto> GetStatsAsync(DateOnly? from, DateOnly? to);
}
