using System.Security.Claims;
using FamilyDashboard.Api.Data;
using FamilyDashboard.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CalendarEventsController(AppDbContext dbContext) : ControllerBase
{
    // GET /api/calendarEvents?from=2026-06-01&to=2026-07-01
    // "from"/"to" is a filter on the collection, not a separate
    // resource — the frontend decides what range it wants (a month
    // view today, maybe a week view later) and this one endpoint
    // serves all of them.
    //
    // Visibility: a private event (no GroupId) only shows up for its
    // creator; a group event shows up for every member of that
    // group.
    [HttpGet]
    public async Task<ActionResult<List<CalendarEventDto>>> GetAll(DateTime from, DateTime to)
    {
        var userId = GetUserId();

        // The projection is written out directly (not via a ToDto
        // helper method) so EF Core can translate the whole query,
        // including the CreatedByUser.FirstName/LastName join, into
        // a single SQL query instead of failing to translate it.
        var events = await dbContext
            .CalendarEvents.AsNoTracking()
            .Where(e => e.StartsAt >= from && e.StartsAt < to)
            .Where(e =>
                e.CreatedByUserId == userId
                || (e.GroupId != null
                    && dbContext.GroupMembers.Any(gm => gm.GroupId == e.GroupId && gm.UserId == userId))
            )
            .Select(e => new CalendarEventDto(
                e.Id,
                e.Title,
                e.Description,
                e.StartsAt,
                e.CreatedByUserId,
                e.CreatedByUser.FirstName,
                e.CreatedByUser.LastName,
                e.GroupId
            ))
            .ToListAsync();

        return Ok(events);
    }

    // POST /api/calendarEvents
    [HttpPost]
    public async Task<ActionResult<CalendarEventDto>> Create(CreateCalendarEventRequest request)
    {
        var userId = GetUserId();

        var creator = await dbContext.Users.FindAsync(userId);
        if (creator is null)
        {
            return Unauthorized();
        }

        Group? group = null;
        if (request.GroupId is Guid groupId)
        {
            group = await dbContext.Groups.FindAsync(groupId);
            if (group is null)
            {
                return NotFound($"Groep {groupId} bestaat niet.");
            }

            // You can only plan something for a group you're actually
            // in — otherwise anyone could spam another family's group
            // (or a group they were once removed from) with events.
            var isMember = await dbContext.GroupMembers.AnyAsync(gm =>
                gm.GroupId == groupId && gm.UserId == userId
            );
            if (!isMember)
            {
                return BadRequest("Je bent geen lid van deze groep.");
            }
        }

        // Only the navigation properties need to be set — EF Core
        // fills in CreatedByUserId/GroupId itself from these when it
        // saves (same pattern as GroupMembersController.AddMember).
        var calendarEvent = new CalendarEvent
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            StartsAt = request.StartsAt,
            CreatedByUser = creator,
            Group = group,
        };

        dbContext.CalendarEvents.Add(calendarEvent);
        await dbContext.SaveChangesAsync();

        return Ok(
            new CalendarEventDto(
                calendarEvent.Id,
                calendarEvent.Title,
                calendarEvent.Description,
                calendarEvent.StartsAt,
                calendarEvent.CreatedByUserId,
                creator.FirstName,
                creator.LastName,
                calendarEvent.GroupId
            )
        );
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdClaim!);
    }
}

public record CalendarEventDto(
    Guid Id,
    string Title,
    string Description,
    DateTime StartsAt,
    Guid CreatedByUserId,
    string CreatedByUserFirstName,
    string CreatedByUserLastName,
    Guid? GroupId
);

public record CreateCalendarEventRequest(string Title, string Description, DateTime StartsAt, Guid? GroupId);
