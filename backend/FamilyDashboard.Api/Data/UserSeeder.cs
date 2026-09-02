using FamilyDashboard.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Data;

/// <summary>
/// Creates the fixed family accounts on startup, if they don't exist
/// yet. Reads usernames/passwords from configuration (see the
/// "SeedUsers" section) — set those via .NET User Secrets locally, so
/// real passwords never end up in appsettings/git.
/// </summary>
public static class UserSeeder
{
    public static async Task SeedAsync(
        AppDbContext dbContext,
        IPasswordHasher<User> passwordHasher,
        IConfiguration configuration
    )
    {
        var seedUsers = configuration.GetSection("SeedUsers").Get<List<SeedUser>>() ?? [];

        foreach (var seedUser in seedUsers)
        {
            var alreadyExists = await dbContext.Users.AnyAsync(u => u.Username == seedUser.Username);
            if (alreadyExists)
            {
                continue;
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = seedUser.Username,
                PasswordHash = string.Empty, // set right below
                FirstName = seedUser.FirstName,
                LastName = seedUser.LastName,
                IsAdmin = seedUser.IsAdmin,
            };
            user.PasswordHash = passwordHasher.HashPassword(user, seedUser.Password);

            dbContext.Users.Add(user);
        }

        await dbContext.SaveChangesAsync();
    }

    private class SeedUser
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public bool IsAdmin { get; set; }
    }
}
