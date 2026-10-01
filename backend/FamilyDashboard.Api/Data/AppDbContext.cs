using FamilyDashboard.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Recipe> Recipes => Set<Recipe>();

    public DbSet<User> Users => Set<User>();

    public DbSet<Group> Groups => Set<Group>();

    public DbSet<GroupMember> GroupMembers => Set<GroupMember>();

    public DbSet<AppSettings> AppSettings => Set<AppSettings>();

    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Two users can't share a username.
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();

        // Two groups can't share a join code (which currently also
        // doubles as the group's display name).
        modelBuilder.Entity<Group>().HasIndex(g => g.GroupCode).IsUnique();

        // A user can only be a member of a given group once — this is
        // a *composite* unique index (on the combination of both
        // columns), not two separate unique indexes: GroupId and
        // UserId each repeat across many rows on their own (one group
        // has many members, one user can be in many groups), it's
        // only the specific pairing that must be unique.
        modelBuilder
            .Entity<GroupMember>()
            .HasIndex(gm => new { gm.GroupId, gm.UserId })
            .IsUnique();

        // GroupId is optional (a private calendar event has none), so
        // this relationship must be configured explicitly as
        // optional — EF Core's convention would otherwise infer it
        // from the nullable Guid? correctly anyway, but being
        // explicit here documents the intent (and avoids surprises
        // if GroupId's type ever changes).
        modelBuilder
            .Entity<CalendarEvent>()
            .HasOne(e => e.Group)
            .WithMany()
            .HasForeignKey(e => e.GroupId)
            .IsRequired(false);
    }
}
