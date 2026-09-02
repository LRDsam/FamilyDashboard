using FamilyDashboard.Api.Data;
using FamilyDashboard.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecipesController(AppDbContext dbContext) : ControllerBase
{
    // GET /api/recipes
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Recipe>>> GetAll()
    {
        var recipes = await dbContext.Recipes.AsNoTracking().ToListAsync();
        return Ok(recipes);
    }

    // GET /api/recipes/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Recipe>> GetById(Guid id)
    {
        var recipe = await dbContext.Recipes.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);

        return recipe is null ? NotFound() : Ok(recipe);
    }

    // POST /api/recipes
    [HttpPost]
    public async Task<ActionResult<Recipe>> Create(Recipe recipe)
    {
        recipe.Id = Guid.NewGuid();

        dbContext.Recipes.Add(recipe);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, recipe);
    }

    // PUT /api/recipes/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, Recipe recipe)
    {
        if (id != recipe.Id)
        {
            return BadRequest();
        }

        var exists = await dbContext.Recipes.AnyAsync(r => r.Id == id);
        if (!exists)
        {
            return NotFound();
        }

        dbContext.Entry(recipe).State = EntityState.Modified;
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    // DELETE /api/recipes/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var recipe = await dbContext.Recipes.FindAsync(id);
        if (recipe is null)
        {
            return NotFound();
        }

        dbContext.Recipes.Remove(recipe);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}
