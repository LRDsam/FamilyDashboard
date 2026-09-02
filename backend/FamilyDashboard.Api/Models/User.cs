namespace FamilyDashboard.Api.Models;

public class User
{
    public Guid Id { get; set; }

    public required string Username { get; set; }

    /// <summary>
    /// The hashed password — never the plain-text password itself.
    /// Set via <c>IPasswordHasher&lt;User&gt;</c>.
    /// </summary>
    public required string PasswordHash { get; set; }

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    /// <summary>
    /// Whether this user has administrator privileges. Defaults to
    /// <c>false</c> — existing rows get this value automatically when
    /// the migration adds the column.
    /// </summary>
    public bool IsAdmin { get; set; }
}
