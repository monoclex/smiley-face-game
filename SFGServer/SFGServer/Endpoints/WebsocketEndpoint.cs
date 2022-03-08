using System.Buffers;
using System.Net.WebSockets;
using SFGServer.Contracts.Requests;
using SFGServer.Game;
using SFGServer.Models;
using SFGServer.Services;

namespace SFGServer.Endpoints;

// TODO(clean): this endpoint got large lol
public class WebsocketEndpoint : Endpoint<WebsocketRequest>
{
    private readonly RoomManager _roomManager;
    private readonly ArrayPool<byte> _arrayPool;
    private readonly SfgTokenValidator _sfgTokenValidator;
    private readonly IScopedServiceFactory<UsernameRetrievalService> _usernameRetrievalService;

    public WebsocketEndpoint(RoomManager roomManager,
        ArrayPool<byte> arrayPool,
        SfgTokenValidator sfgTokenValidator,
        IScopedServiceFactory<UsernameRetrievalService> usernameRetrievalService)
    {
        _roomManager = roomManager;
        _arrayPool = arrayPool;
        _sfgTokenValidator = sfgTokenValidator;
        _usernameRetrievalService = usernameRetrievalService;
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
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        var user = _sfgTokenValidator.Validate(req.Token);

        if (user == null)
        {
            AddError("Invalid Token!");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        string username;
        using (var scope = _usernameRetrievalService.CreateScopedService())
        {
            username = await scope.Service.GetUsername(user, ct);
        }

        var room = req.World switch
        {
            // TODO(clean): perhaps we should set the room name/owner after we create the dynamic room instead of pass `username` thru here
            WebsocketJoin.Create create => await _roomManager.CreateDynamicRoom(username, create, ct),
            WebsocketJoin.Join join => await _roomManager.JoinRoom(new RoomId(join.Id), ct),
            _ => throw new InvalidOperationException("Invalid world request!"),
        };

        if (room == null)
        {
            AddError("Room does not exist!");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();

        var hostConnection = await room.AcceptConnection(webSocket, user.GetUserId(), username, ct);
        var connectionId = hostConnection.connectionId;

        try
        {
            using var rent = _arrayPool.UseRent(16 * 1024);

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
                    // TODO(errors): tell the user they sent too big of a packet (over 16K)
                    return;
                }

                var readBytes = memory[0..read.Count];

                await room.FireMessage(connectionId, readBytes, ct).ConfigureAwait(false);
            }
        }
        finally
        {
            await room.Disconnect(connectionId, ct).ConfigureAwait(false);
        }
    }
}
