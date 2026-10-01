using System.Security.Claims;
using FamilyDashboard.Api.Models;
using FamilyDashboard.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GroupsController(AppDbContext dbContext) : ControllerBase
{
    // GET /api/groups
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Group>>> GetAll()
    {
        var groups = await dbContext.Groups.AsNoTracking().ToListAsync();
        return Ok(groups);
    }

    // GET /api/groups/mine
    // Only the groups the current user is actually a member of —
    // e.g. for picking a group to attach a calendar event to, where
    // picking a group you're not in would just be rejected anyway.
    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<Group>>> GetMine()
    {
        var userId = GetUserId();

        var groups = await dbContext
            .GroupMembers.AsNoTracking()
            .Where(gm => gm.UserId == userId)
            .Select(gm => gm.Group)
            .ToListAsync();

        return Ok(groups);
    }

    // GET /api/groups/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Group>> GetById(Guid id)
    {
        var group = await dbContext.Groups.AsNoTracking().FirstOrDefaultAsync(g => g.Id == id);

        return group is null ? NotFound() : Ok(group);
    }

    // POST /api/groups
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Group>> Create(Group group)
    {
        group.Id = Guid.NewGuid();

        dbContext.Groups.Add(group);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = group.Id}, group);
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdClaim!);
    }
}
