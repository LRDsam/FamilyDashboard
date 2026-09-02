using FamilyDashboard.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Recipe> Recipes => Set<Recipe>();

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Two users can't share a username.
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
    }
}
