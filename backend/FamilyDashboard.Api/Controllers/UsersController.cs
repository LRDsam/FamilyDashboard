using System.Security.Claims;
using FamilyDashboard.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(AppDbContext dbContext) : ControllerBase
{
    // GET /api/users/me
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetMe()
    {
        var userId = GetUserId();

        var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(new UserDto(user.Id, user.Username, user.FirstName, user.LastName, user.IsAdmin));
    }

    // PUT /api/users/me
    [HttpPut("me")]
    public async Task<ActionResult<UserDto>> UpdateMe(UpdateProfileRequest request)
    {
        var userId = GetUserId();

        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return NotFound();
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        await dbContext.SaveChangesAsync();

        return Ok(new UserDto(user.Id, user.Username, user.FirstName, user.LastName, user.IsAdmin));
    }

    // The JWT's NameIdentifier claim holds the user's Id (see
    // JwtTokenGenerator) — this reads it back out of the validated
    // token for the currently authenticated request.
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdClaim!);
    }
}

public record UserDto(Guid Id, string Username, string FirstName, string LastName, bool IsAdmin);

public record UpdateProfileRequest(string FirstName, string LastName);
