namespace FamilyDashboard.Api.Models;

public class Recipe
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public required string Description { get; set; }

    public required string ImageUrl { get; set; }

    public required string Link { get; set; }
}
