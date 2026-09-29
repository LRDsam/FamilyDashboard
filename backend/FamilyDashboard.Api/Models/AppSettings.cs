namespace FamilyDashboard.Api.Models;

/// <summary>
/// Singleton settings record — there is always exactly one row (see
/// AppSettingsSeeder). Holds general app-wide configuration that's
/// set up at runtime rather than at deploy time, starting with the
/// Philips Hue bridge pairing details.
/// </summary>
public class AppSettings
{
    public Guid Id { get; set; }

    /// <summary>
    /// Local IP address of the Hue bridge on the home network,
    /// discovered via Hue's discovery service. Null until discovery
    /// has run at least once.
    /// </summary>
    public string? HueBridgeIp { get; set; }

    /// <summary>
    /// The "username"/application key obtained from the bridge after
    /// a successful pairing (link-button press). Null until pairing
    /// has succeeded.
    /// </summary>
    public string? HueApplicationKey { get; set; }
}
