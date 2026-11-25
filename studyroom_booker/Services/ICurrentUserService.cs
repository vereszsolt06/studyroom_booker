namespace studyroom_booker.Services;

public interface ICurrentUserService
{
    int UserId { get; }
    bool IsAdmin { get; }
}