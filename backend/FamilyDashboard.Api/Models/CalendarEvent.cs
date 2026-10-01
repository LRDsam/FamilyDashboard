namespace FamilyDashboard.Api.Models;

public class CalendarEvent
{
    public Guid Id { get; set; }

    public required string Title { get; set; }

    public required string Description { get; set; }

    public DateTime StartsAt { get; set; }

    public Guid CreatedByUserId { get; set; }
    public required User CreatedByUser { get; set; }

    /// <summary>
    /// Optioneel: als gezet, is dit agendapunt zichtbaar voor iedereen
    /// in deze groep. Als dit leeg is, is het agendapunt privé — dan
    /// is het alleen zichtbaar voor CreatedByUser.
    /// </summary>
    public Guid? GroupId { get; set; }
    public Group? Group { get; set; }
}
