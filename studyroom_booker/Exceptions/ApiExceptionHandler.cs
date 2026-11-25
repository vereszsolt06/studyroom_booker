using Microsoft.AspNetCore.Diagnostics;
using studyroom_booker.Dtos;

namespace studyroom_booker.Exceptions;

public class ApiExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        // If the exception is not an ApiException, we return it as 500 Internal Server Error
        if (exception is not ApiException apiException) return false;

        httpContext.Response.StatusCode = apiException.StatusCode;
        await httpContext.Response.WriteAsJsonAsync(new ApiError(apiException.Message), cancellationToken);
        return true;
    }
}