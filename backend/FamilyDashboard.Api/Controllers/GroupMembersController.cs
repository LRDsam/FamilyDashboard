using FamilyDashboard.Api.Data;
using FamilyDashboard.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Controllers;

// Nested under /api/groups/{groupId}/members: a membership is a
// sub-resource of a group, it doesn't make sense on its own. Any
// logged-in user can view members; only admins can add/remove them.
[ApiController]
[Route("api/groups/{groupId:guid}/members")]
[Authorize]
public class GroupMembersController(AppDbContext dbContext) : ControllerBase
{
    // GET /api/groups/{groupId}/members
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll(Guid groupId)
    {
        var groupExists = await dbContext.Groups.AnyAsync(g => g.Id == groupId);
        if (!groupExists)
        {
            return NotFound();
        }

        var members = await dbContext
            .GroupMembers.AsNoTracking()
            .Where(gm => gm.GroupId == groupId)
            .Select(gm => new UserDto(
                gm.User.Id,
                gm.User.Username,
                gm.User.FirstName,
                gm.User.LastName,
                gm.User.IsAdmin
            ))
            .ToListAsync();

        return Ok(members);
    }

    // POST /api/groups/{groupId}/members
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddMember(Guid groupId, AddGroupMemberRequest request)
    {
        var group = await dbContext.Groups.FindAsync(groupId);
        if (group is null)
        {
            return NotFound($"Groep {groupId} bestaat niet.");
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user is null)
        {
            return NotFound($"Gebruiker '{request.Username}' bestaat niet.");
        }

        var alreadyMember = await dbContext.GroupMembers.AnyAsync(gm =>
            gm.GroupId == groupId && gm.UserId == user.Id
        );
        if (alreadyMember)
        {
            return Conflict("Deze gebruiker is al lid van deze groep.");
        }

        // Only the navigation properties need to be set — EF Core
        // fills in GroupId/UserId itself from these when it saves.
        dbContext.GroupMembers.Add(
            new GroupMember
            {
                Id = Guid.NewGuid(),
                Group = group,
                User = user,
            }
        );
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    // DELETE /api/groups/{groupId}/members/{userId}
    [HttpDelete("{userId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveMember(Guid groupId, Guid userId)
    {
        var member = await dbContext.GroupMembers.FirstOrDefaultAsync(gm =>
            gm.GroupId == groupId && gm.UserId == userId
        );

        if (member is null)
        {
            return NotFound();
        }

        dbContext.GroupMembers.Remove(member);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}

public record AddGroupMemberRequest(string Username);
