// ReSharper disable InconsistentNaming
using System.Buffers;
using System.Net.WebSockets;
using System.Text;
using JetBrains.Annotations;

namespace SFGServer.Game.HostStructures;

public class HostConnection
{
    internal WebSocket WebSocket { get; }

    [UsedImplicitly]
    public int connectionId { get; }

    // UserId is =/= => userId to save nanoseconds (.ToString() conversion on every access)
    internal Guid? UserId { get; }

    [UsedImplicitly]
    public string? userId { get; }

    [UsedImplicitly]
    public string username { get; }

    public HostConnection(WebSocket webSocket, int connectionId, Guid? userId, string username)
    {
        WebSocket = webSocket;
        this.connectionId = connectionId;
        UserId = userId;
        this.userId = userId?.ToString();
        this.username = username;
    }

    // TODO(correctness): we should be wrapping around the websocket properly, and implement a queue of things to do.
    //   currently, players can commit a small-scale DoS attack by connection and disconnecting many accounts,
    //   as every disconnect will result in ~200ms of server stall.

    [UsedImplicitly]
    public async ValueTask send(string data)
    {
        if (WebSocket.State != WebSocketState.Open)
        {
            return;
        }

        var encoding = Encoding.UTF8;
        var pool = ArrayPool<byte>.Shared;

        var bytes = pool.Rent(encoding.GetByteCount(data));

        try
        {
            encoding.GetBytes(data, bytes.AsSpan());

            await WebSocket.SendAsync(bytes.AsMemory(), WebSocketMessageType.Text, endOfMessage: true, cancellationToken: default);
        }
        finally
        {
            pool.Return(bytes);
        }
    }

    [UsedImplicitly]
    public async ValueTask close(string reason)
    {
        var cts = new CancellationTokenSource();
        cts.CancelAfter(TimeSpan.FromMilliseconds(200));

        try
        {
            await WebSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, reason, cts.Token);
        }
        catch (TaskCanceledException)
        {
            WebSocket.Abort();
        }
    }
}

