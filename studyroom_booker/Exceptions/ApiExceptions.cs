namespace studyroom_booker.Exceptions;

// The service throws them, the global ApiExceptionHandler converts them to HTTP responses
public abstract class ApiException(int statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public class BadRequestException(string message) : ApiException(StatusCodes.Status400BadRequest, message);

public class NotFoundException(string message) : ApiException(StatusCodes.Status404NotFound, message);

public class ConflictException(string message) : ApiException(StatusCodes.Status409Conflict, message);

public class UnauthorizedException(string message) : ApiException(StatusCodes.Status401Unauthorized, message);

public class ForbiddenException(string message) : ApiException(StatusCodes.Status403Forbidden, message);