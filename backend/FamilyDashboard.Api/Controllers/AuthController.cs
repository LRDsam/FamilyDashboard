using FamilyDashboard.Api.Data;
using FamilyDashboard.Api.Models;
using FamilyDashboard.Api.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    AppDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    JwtTokenGenerator jwtTokenGenerator
) : ControllerBase
{
    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

        // Deliberately the same response for "unknown username" and
        // "wrong password" — otherwise an attacker could tell the two
        // apart and use that to figure out which usernames exist.
        if (user is null)
        {
            return Unauthorized();
        }

        var verificationResult = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return Unauthorized();
        }

        var token = jwtTokenGenerator.GenerateToken(user);

        return Ok(new LoginResponse(token, user.Username));
    }
}

public record LoginRequest(string Username, string Password);

public record LoginResponse(string Token, string Username);
