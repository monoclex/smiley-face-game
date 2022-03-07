using System.Buffers;
using Newtonsoft.Json;
using SFGServer.Contracts.Requests;
using SFGServer.Game;
using SFGServer.Services;

namespace SFGServer.Endpoints;

public class WebsocketEndpoint : Endpoint<WebsocketRequest>
{
    private readonly RoomManager _roomManager;

    public WebsocketEndpoint(RoomManager roomManager, ArrayPool<byte> arrayPool)
    {
        _roomManager = roomManager;
    }

    public override void Configure()
    {
        Get("/game/ws");
    }

    public override async Task HandleAsync(WebsocketRequest req, CancellationToken ct)
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();

            var room = await _roomManager.JoinRoom(req.Id, ct);
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }
}
