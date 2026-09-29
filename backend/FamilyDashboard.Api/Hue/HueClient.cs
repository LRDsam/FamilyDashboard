using System.Text.Json.Serialization;

namespace FamilyDashboard.Api.Hue;

/// <summary>
/// Talks to Philips Hue's own services — the public discovery
/// service, and the bridge's local CLIP v2 API. Knows nothing about
/// our database; it just fetches/sends data and hands results back
/// to whoever calls it (see HueController for where those results
/// end up getting stored in AppSettings, or exposed to the frontend).
/// </summary>
public class HueClient(HttpClient httpClient, IConfiguration configuration)
{
    private const string DiscoveryUrl = "https://discovery.meethue.com/";

    /// <summary>
    /// Asks Hue's discovery service for bridges on this network.
    /// Returns the first bridge's local IP, or null if none was found.
    /// </summary>
    public async Task<string?> DiscoverBridgeIpAsync()
    {
        var results = await httpClient.GetFromJsonAsync<List<HueDiscoveryEntry>>(DiscoveryUrl);
        return results?.FirstOrDefault()?.InternalIpAddress;
    }

    /// <summary>
    /// Attempts to register a new application key ("username") with
    /// the bridge at the given IP. The bridge only allows this within
    /// ~30 seconds of its physical link button being pressed — before
    /// that, it replies with a "link button not pressed" error rather
    /// than an HTTP error status, which is why the result here is a
    /// Paired flag rather than an exception.
    /// </summary>
    public async Task<HuePairingResult> RegisterApplicationKeyAsync(string bridgeIp)
    {
        var deviceType =
            configuration.GetSection("Hue")["DeviceType"]
            ?? throw new InvalidOperationException("Hue:DeviceType is not configured.");

        var response = await httpClient.PostAsJsonAsync(
            $"https://{bridgeIp}/api",
            new HuePairingRequest(deviceType)
        );
        var results = await response.Content.ReadFromJsonAsync<List<HueApiResponse>>();
        var result = results?.FirstOrDefault();

        if (result?.Success is not null)
        {
            return new HuePairingResult(true, result.Success.Username, null);
        }

        var message = result?.Error?.Description ?? "Onbekende fout bij het koppelen met de Hue-bridge.";
        return new HuePairingResult(false, null, message);
    }

    /// <summary>
    /// Fetches all lights known to the bridge, via the CLIP v2 API.
    /// Unlike discovery/pairing, this needs the application key from
    /// a successful RegisterApplicationKeyAsync call, sent as the
    /// "hue-application-key" header rather than in the URL.
    /// </summary>
    public async Task<List<HueLight>> GetLightsAsync(string bridgeIp, string applicationKey)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"https://{bridgeIp}/clip/v2/resource/light");
        request.Headers.Add("hue-application-key", applicationKey);

        var response = await httpClient.SendAsync(request);
        var envelope = await response.Content.ReadFromJsonAsync<HueLightsEnvelope>();

        return envelope?.Data.Select(MapLight).ToList() ?? [];
    }

    /// <summary>
    /// Turns a light on or off.
    /// </summary>
    public async Task SetOnAsync(string bridgeIp, string applicationKey, string lightId, bool on)
    {
        await SendLightUpdateAsync(bridgeIp, applicationKey, lightId, new HueLightOnUpdate(new HueOnState(on)));
    }

    /// <summary>
    /// Sets a light's brightness (0–100%). The bridge itself refuses
    /// a literal 0 and clamps it to the lowest possible brightness
    /// instead.
    /// </summary>
    public async Task SetBrightnessAsync(string bridgeIp, string applicationKey, string lightId, double brightness)
    {
        await SendLightUpdateAsync(
            bridgeIp,
            applicationKey,
            lightId,
            new HueLightDimmingUpdate(new HueDimmingState(brightness))
        );
    }

    private async Task SendLightUpdateAsync(string bridgeIp, string applicationKey, string lightId, object body)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Put,
            $"https://{bridgeIp}/clip/v2/resource/light/{lightId}"
        )
        {
            Content = JsonContent.Create(body),
        };
        request.Headers.Add("hue-application-key", applicationKey);

        var response = await httpClient.SendAsync(request);

        // Only catches HTTP-level failures (e.g. a 404 for an
        // unknown light id). The bridge can also return 200 OK with
        // a populated "errors" array in the body — we don't parse
        // that here, same simplification as GetLightsAsync.
        response.EnsureSuccessStatusCode();
    }

    private static HueLight MapLight(HueLightData data) =>
        new(data.Id, data.Metadata.Name, data.On.On, data.Dimming?.Brightness);

    // Hue's discovery response uses lowercase, no-separator field
    // names ("id", "internalipaddress") — the JsonPropertyName
    // attributes map those onto normal C# property names.
    private record HueDiscoveryEntry(
        [property: JsonPropertyName("id")] string Id,
        [property: JsonPropertyName("internalipaddress")] string InternalIpAddress
    );

    private record HuePairingRequest([property: JsonPropertyName("devicetype")] string DeviceType);

    private record HueApiResponse(
        [property: JsonPropertyName("success")] HueSuccess? Success,
        [property: JsonPropertyName("error")] HueError? Error
    );

    private record HueSuccess([property: JsonPropertyName("username")] string Username);

    private record HueError(
        [property: JsonPropertyName("type")] int Type,
        [property: JsonPropertyName("description")] string Description
    );

    // CLIP v2 wraps every response in an envelope with "errors" and
    // "data" — we only need "data" here, one entry per light.
    private record HueLightsEnvelope([property: JsonPropertyName("data")] List<HueLightData> Data);

    private record HueLightData(
        [property: JsonPropertyName("id")] string Id,
        [property: JsonPropertyName("metadata")] HueLightMetadata Metadata,
        [property: JsonPropertyName("on")] HueOnState On,
        // Nullable: lights/plugs without dimming support omit this
        // field entirely rather than sending a default value.
        [property: JsonPropertyName("dimming")] HueDimmingState? Dimming
    );

    private record HueLightMetadata([property: JsonPropertyName("name")] string Name);

    // Reused for both reading a light's state (GetLightsAsync) and
    // writing it (SetOnAsync/SetBrightnessAsync) — the shape Hue
    // expects/returns is identical either way.
    private record HueOnState([property: JsonPropertyName("on")] bool On);

    private record HueDimmingState([property: JsonPropertyName("brightness")] double Brightness);

    private record HueLightOnUpdate([property: JsonPropertyName("on")] HueOnState On);

    private record HueLightDimmingUpdate([property: JsonPropertyName("dimming")] HueDimmingState Dimming);
}

/// <summary>
/// Result of a pairing attempt: either Paired is true and
/// ApplicationKey holds the new key, or Paired is false and
/// ErrorMessage explains why (most commonly: link button not
/// pressed yet).
/// </summary>
public record HuePairingResult(bool Paired, string? ApplicationKey, string? ErrorMessage);

/// <summary>
/// One light, cleaned up from Hue's CLIP v2 shape down to what the
/// rest of the app actually needs. Brightness is null for
/// lights/plugs that don't support dimming.
/// </summary>
public record HueLight(string Id, string Name, bool On, double? Brightness);
