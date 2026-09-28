namespace FamilyDashboard.Api.Models;

/// <summary>
/// A membership: links one User to one Group. EF Core infers the
/// foreign keys from the "<NavigationProperty>Id" naming convention —
/// GroupId belongs to the Group navigation property, UserId to User.
/// </summary>
public class GroupMember
{
    public Guid Id { get; set; }

    public Guid GroupId { get; set; }
    public required Group Group { get; set; }

    public Guid UserId { get; set; }
    public required User User { get; set; }
}
