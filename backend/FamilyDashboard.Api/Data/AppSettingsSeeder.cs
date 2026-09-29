using FamilyDashboard.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Data;

/// <summary>
/// Ensures exactly one AppSettings row exists, creating it (with
/// empty Hue fields) on first startup if it doesn't. Idempotent, like
/// UserSeeder — safe to run on every startup.
/// </summary>
public static class AppSettingsSeeder
{
    public static async Task SeedAsync(AppDbContext dbContext)
    {
        var alreadyExists = await dbContext.AppSettings.AnyAsync();
        if (alreadyExists)
        {
            return;
        }

        dbContext.AppSettings.Add(new AppSettings { Id = Guid.NewGuid() });
        await dbContext.SaveChangesAsync();
    }
}
