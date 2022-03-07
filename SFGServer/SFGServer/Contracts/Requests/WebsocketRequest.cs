using Microsoft.AspNetCore.Mvc;
using SFGServer.Models;
using SFGServer.Services;

namespace SFGServer.Contracts.Requests;

public enum PayloadType
{
    Create,
    Join
}

public record WebsocketRequest
{
    [FromClaim(TokenSigner.UserIdClaimKey, IsRequired = false)]
    public Guid? UserId { get; set; }

    [FromClaim(TokenSigner.GuestUsername, IsRequired = false)]
    public string? GuestUsername { get; set; }

    [FromQuery]
    public PayloadType Type { get; set; }

    [FromQuery]
    public string? Name { get; set; }

    [FromQuery]
    public int? Width { get; set; }

    [FromQuery]
    public int? Height { get; set; }

    [FromQuery]
    public RoomId? Id { get; set; }
}
