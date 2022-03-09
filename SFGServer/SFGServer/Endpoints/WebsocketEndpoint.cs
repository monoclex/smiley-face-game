using System.Buffers;
using System.Net.WebSockets;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using SFGServer.Contracts.Requests;
using SFGServer.Game;
using SFGServer.Services;

namespace SFGServer.Endpoints;

public class WebsocketEndpoint : Endpoint<WebsocketRequest>
{
    private readonly RoomManager _roomManager;
    private readonly ArrayPool<byte> _arrayPool;
    private readonly SfgTokenValidator _sfgTokenValidator;

    public WebsocketEndpoint(RoomManager roomManager, ArrayPool<byte> arrayPool, SfgTokenValidator sfgTokenValidator)
    {
        _roomManager = roomManager;
        _arrayPool = arrayPool;
        _sfgTokenValidator = sfgTokenValidator;
    }

    public override void Configure()
    {
        Get("/game/ws");
        AllowAnonymous();
    }

    public override async Task HandleAsync(WebsocketRequest req, CancellationToken ct)
    {
        if (!HttpContext.WebSockets.IsWebSocketRequest)
        {
            AddError("You must begin a websocket connection on this endpoint!");
            await SendErrorsAsync(ct);
            return;
        }

        var user = _sfgTokenValidator.Validate(req.Token);

        if (user == null)
        {
            AddError("Invalid Token!");
            await SendErrorsAsync(ct);
            return;
        }

        using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
        using var rent = _arrayPool.UseRent(4096);

        var memory = new Memory<byte>(rent.Buffer);

        while (true)
        {
            var read = await webSocket.ReceiveAsync(memory, ct).ConfigureAwait(false);

            if (read.MessageType == WebSocketMessageType.Close)
            {
                return;
            }

            if (!read.EndOfMessage)
            {
                // TODO(errors): tell the user they sent too big of a packet (we read the entire packet in one go)
                return;
            }

            var readBytes = memory[0..read.Count];

            // TODO(javascript): send the bytes to the V8 isolate
        }

        // var room = await _roomManager.JoinRoom(req.Id, ct);
    }
}
