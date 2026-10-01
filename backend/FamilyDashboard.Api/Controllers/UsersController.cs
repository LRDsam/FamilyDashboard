using System.Security.Claims;
using FamilyDashboard.Api.Data;
using FamilyDashboard.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(AppDbContext dbContext, IPasswordHasher<User> passwordHasher) : ControllerBase
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

    // GET /api/users
    // Lists every account, for the admin's user-management page.
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        var users = await dbContext.Users
            .AsNoTracking()
            .OrderBy(u => u.Username)
            .Select(u => new UserDto(u.Id, u.Username, u.FirstName, u.LastName, u.IsAdmin))
            .ToListAsync();

        return Ok(users);
    }

    // POST /api/users
    // Creates a new account. Admin-only — this is how new family
    // members get an account from now on, replacing the old
    // .env-based SeedUsers setup.
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> Create(CreateUserRequest request)
    {
        var usernameTaken = await dbContext.Users.AnyAsync(u => u.Username == request.Username);
        if (usernameTaken)
        {
            return Conflict("Deze gebruikersnaam is al in gebruik.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            PasswordHash = string.Empty, // set right below
            FirstName = request.FirstName,
            LastName = request.LastName,
            IsAdmin = request.IsAdmin,
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAll),
            new UserDto(user.Id, user.Username, user.FirstName, user.LastName, user.IsAdmin)
        );
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

public record CreateUserRequest(
    string Username,
    string Password,
    string FirstName,
    string LastName,
    bool IsAdmin
);
