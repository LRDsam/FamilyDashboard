using FamilyDashboard.Api.Data;
using FamilyDashboard.Api.Hue;
using FamilyDashboard.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HueController(AppDbContext dbContext, HueClient hueClient) : ControllerBase
{
    /// <summary>
    /// Reports the current Hue setup state — whether a bridge has
    /// been discovered and whether pairing has succeeded — so the
    /// frontend can decide which part of the page to show, without
    /// this itself calling out to the bridge or discovery service.
    /// </summary>
    [HttpGet("status")]
    public async Task<ActionResult<HueStatusResponse>> Status()
    {
        var settings = await dbContext.AppSettings.SingleAsync();
        return Ok(new HueStatusResponse(settings.HueBridgeIp, settings.HueApplicationKey is not null));
    }

    /// <summary>
    /// Looks up the Hue bridge on the local network via Hue's
    /// discovery service, and stores its IP in AppSettings.
    /// </summary>
    [HttpPost("discover")]
    public async Task<ActionResult<HueDiscoverResponse>> Discover()
    {
        var bridgeIp = await hueClient.DiscoverBridgeIpAsync();
        if (bridgeIp is null)
        {
            return NotFound("Geen Hue-bridge gevonden op dit netwerk.");
        }

        var settings = await dbContext.AppSettings.SingleAsync();
        settings.HueBridgeIp = bridgeIp;
        await dbContext.SaveChangesAsync();

        return Ok(new HueDiscoverResponse(bridgeIp));
    }

    /// <summary>
    /// Attempts to register an application key with the bridge found
    /// via Discover(). Only succeeds within ~30 seconds of the link
    /// button on the bridge being pressed — call this again (the
    /// frontend's "Bevestigen" step) after the user has pressed it.
    /// </summary>
    [HttpPost("pair")]
    public async Task<ActionResult<HuePairResponse>> Pair()
    {
        var settings = await dbContext.AppSettings.SingleAsync();

        if (settings.HueBridgeIp is null)
        {
            return BadRequest("Er is nog geen Hue-bridge gevonden. Voer eerst discovery uit.");
        }

        var result = await hueClient.RegisterApplicationKeyAsync(settings.HueBridgeIp);

        if (!result.Paired)
        {
            return Ok(new HuePairResponse(false, result.ErrorMessage));
        }

        settings.HueApplicationKey = result.ApplicationKey;
        await dbContext.SaveChangesAsync();

        return Ok(new HuePairResponse(true, null));
    }

    /// <summary>
    /// Lists all lights known to the bridge. Requires a completed
    /// pairing (see Pair()) — there's no bridge IP/application key to
    /// call the bridge with otherwise.
    /// </summary>
    [HttpGet("lights")]
    public async Task<ActionResult<List<HueLight>>> GetLights()
    {
        var settings = await GetPairedSettingsAsync();
        if (settings is null)
        {
            return BadRequest("Nog niet gekoppeld met een Hue-bridge.");
        }

        var lights = await hueClient.GetLightsAsync(settings.HueBridgeIp!, settings.HueApplicationKey!);
        return Ok(lights);
    }

    /// <summary>
    /// Turns one light on or off.
    /// </summary>
    [HttpPut("lights/{id}/on")]
    public async Task<IActionResult> SetLightOn(string id, SetLightOnRequest request)
    {
        var settings = await GetPairedSettingsAsync();
        if (settings is null)
        {
            return BadRequest("Nog niet gekoppeld met een Hue-bridge.");
        }

        await hueClient.SetOnAsync(settings.HueBridgeIp!, settings.HueApplicationKey!, id, request.On);
        return NoContent();
    }

    /// <summary>
    /// Sets one light's brightness (0–100%).
    /// </summary>
    [HttpPut("lights/{id}/brightness")]
    public async Task<IActionResult> SetLightBrightness(string id, SetLightBrightnessRequest request)
    {
        var settings = await GetPairedSettingsAsync();
        if (settings is null)
        {
            return BadRequest("Nog niet gekoppeld met een Hue-bridge.");
        }

        await hueClient.SetBrightnessAsync(
            settings.HueBridgeIp!,
            settings.HueApplicationKey!,
            id,
            request.Brightness
        );
        return NoContent();
    }

    /// <summary>
    /// Reads AppSettings and returns it only if both the bridge IP
    /// and application key are known — the shared "are we actually
    /// ready to call the bridge" check used by every light-related
    /// action above.
    /// </summary>
    private async Task<AppSettings?> GetPairedSettingsAsync()
    {
        var settings = await dbContext.AppSettings.SingleAsync();
        return settings.HueBridgeIp is not null && settings.HueApplicationKey is not null ? settings : null;
    }
}

public record HueStatusResponse(string? BridgeIp, bool IsPaired);

public record HueDiscoverResponse(string BridgeIp);

public record HuePairResponse(bool Paired, string? Message);

public record SetLightOnRequest(bool On);

public record SetLightBrightnessRequest(double Brightness);
