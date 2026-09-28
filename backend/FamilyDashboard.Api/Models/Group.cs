namespace FamilyDashboard.Api.Models;

public class Group
{
    public Guid Id { get; set; }

    /// <summary>
    /// Unique code members use to join — currently also doubles as
    /// the group's display name.
    /// </summary>
    public required string GroupCode { get; set; }

    public required string Description { get; set; }

    // Navigation property: the memberships belonging to this group.
    // Together with GroupMember.Group, this is how EF Core
    // understands the one-to-many relationship between Group and
    // GroupMember.
    public ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();
}
