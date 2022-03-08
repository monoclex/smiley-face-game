// ReSharper disable InconsistentNaming

using System.Buffers;
using System.Net.WebSockets;
using System.Text;
using JetBrains.Annotations;
using SFGServer.Models;

namespace SFGServer.Game;

public class HostObject
{
    private readonly RoomManager _roomManager;
    private readonly RoomId _roomId;

    public HostObject(RoomManager roomManager, RoomId roomId)
    {
        _roomManager = roomManager;
        _roomId = roomId;
    }

    [UsedImplicitly]
    public void signalKill()
    {
        Task.Run(async () =>
        {
            await _roomManager.SignalKill(_roomId);
        });
    }
}

public class HostWorldData
{
    [UsedImplicitly]
    public int worldDataVersion { get; }

    [UsedImplicitly]
    public string worldData { get; }

    public HostWorldData(int worldDataVersion, string worldData)
    {
        worldDataVersion = worldDataVersion;
        worldData = worldData;
    }
}

public class HostConnection
{
    private readonly WebSocket _webSocket;

    [UsedImplicitly]
    public string? userId { get; }

    [UsedImplicitly]
    public string username { get; }

    public HostConnection(WebSocket webSocket, string? userId, string username)
    {
        _webSocket = webSocket;
        this.userId = userId;
        this.username = username;
    }

    // TODO(correctness): we should be wrapping around the websocket properly, and implement a queue of things to do.
    //   currently, players can commit a small-scale DoS attack by connection and disconnecting many accounts,
    //   as every disconnect will result in ~200ms of server stall.

    [UsedImplicitly]
    public async ValueTask send(string data)
    {
        if (_webSocket.State != WebSocketState.Open)
        {
            return;
        }

        var encoding = Encoding.UTF8;
        var pool = ArrayPool<byte>.Shared;

        var bytes = pool.Rent(encoding.GetByteCount(data));

        try
        {
            encoding.GetBytes(data, bytes.AsSpan());

            await _webSocket.SendAsync(bytes.AsMemory(), WebSocketMessageType.Text, endOfMessage: true, cancellationToken: default);
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
            await _webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, reason, cts.Token);
        }
        catch (TaskCanceledException)
        {
            _webSocket.Abort();
        }
    }
}

public class HostRoom
{
    private readonly ISavingBehavior _savingBehavior;

    [UsedImplicitly]
    public string id { get; }

    [UsedImplicitly]
    public bool isSavedRoom => _savingBehavior is SavedWorldSavingBehavior;

    [UsedImplicitly]
    public string name { get; }

    [UsedImplicitly]
    public string? ownerId { get; }

    [UsedImplicitly]
    public string? ownerUsername { get; }

    [UsedImplicitly]
    public int width { get; }

    [UsedImplicitly]
    public int height { get; }

    public HostRoom(string id, ISavingBehavior savingBehavior)
    {
        _savingBehavior = savingBehavior;
        this.id = id;
    }

    [UsedImplicitly]
    public Task<HostWorldData> load() => _savingBehavior.Load();

    [UsedImplicitly]
    public Task save(HostWorldData worldData) => _savingBehavior.Save(worldData);
}
