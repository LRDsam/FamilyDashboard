using FamilyDashboard.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Data;

/// <summary>
/// Creates the one fixed bootstrap account ("FDB-ADMIN") on startup,
/// if it doesn't exist yet. This is the only user the application
/// seeds itself — every other account is created afterwards by an
/// admin through the dashboard (see UsersController).
///
/// Only the password is configurable, via the "AdminUser:Password"
/// setting — set that through .NET User Secrets locally, or the
/// ADMIN_PASSWORD variable in .env for Docker, so it never ends up in
/// appsettings/git.
/// </summary>
public static class UserSeeder
{
    private const string AdminUsername = "FDB-ADMIN";

    public static async Task SeedAsync(
        AppDbContext dbContext,
        IPasswordHasher<User> passwordHasher,
        IConfiguration configuration
    )
    {
        var alreadyExists = await dbContext.Users.AnyAsync(u => u.Username == AdminUsername);
        if (alreadyExists)
        {
            return;
        }

        var password =
            configuration["AdminUser:Password"]
            ?? throw new InvalidOperationException("AdminUser:Password is not configured.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = AdminUsername,
            PasswordHash = string.Empty, // set right below
            FirstName = "FDB",
            LastName = "Admin",
            IsAdmin = true,
        };
        user.PasswordHash = passwordHasher.HashPassword(user, password);

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
    }
}
