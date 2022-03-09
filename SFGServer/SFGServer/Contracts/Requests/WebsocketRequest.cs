using System.Diagnostics.CodeAnalysis;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using SFGServer.Models;
using SFGServer.Services;

namespace SFGServer.Contracts.Requests;

public enum PayloadType
{
    Create,
    Join
}

public record WebsocketJoin
{
    public PayloadType Type { get; set; }

    public string? Name { get; set; }

    public int? Width { get; set; }

    public int? Height { get; set; }

    public RoomId? Id { get; set; }

    // https://fast-endpoints.com/wiki/Model-Binding.html#form-fieldsroutequeryclaimsheaders
    private static JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
    };

    public static bool TryParse(string? input, [NotNullWhen(returnValue: true)] out WebsocketJoin? output)
    {
        output = null;

        if (input == null)
        {
            return false;
        }

        output = JsonSerializer.Deserialize<WebsocketJoin>(input, _options);
        return output != null;
    }
}

public record WebsocketRequest
{
    [FromQuery]
    public string Token { get; set; }

    [FromQuery]
    public WebsocketJoin World { get; set; }
}
