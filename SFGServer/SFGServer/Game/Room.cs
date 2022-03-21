using Microsoft.ClearScript.V8;
using Prometheus;
using SFGServer.Game.HostStructures;
using SFGServer.Models;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Channels;
using Microsoft.AspNetCore.Connections;

namespace SFGServer.Game;

public class Room : IDisposable
{
    public RoomId Id => HostRoom.RoomId;

    public string Name { get => HostRoom.name; set => HostRoom.name = value; }

    public int PlayerCount => RoomLogic.Connections.Count;

    public HostRoom HostRoom { get; }

    public RoomLogic RoomLogic { get; }

    public V8ScriptEngine Engine => RoomLogic.Engine;

    public Room(V8ScriptEngine engine, HostRoom hostRoom)
    {
        HostRoom = hostRoom;
        RoomLogic = new RoomLogic(this, engine);
    }

    public void Dispose()
    {
        RoomLogic.EventLoopCancellationToken.Cancel();
    }

    public async Task<HostConnection> AcceptConnection(WebSocket connection, Guid? userId, string username, CancellationToken cancellationToken)
    {
        var isOwner = false;

        if (userId != null)
        {
            isOwner = await HostRoom.SavingBehavior.IsOwner(userId.Value);
        }

        var tcs = new TaskCompletionSource<HostConnection>();
        var queueItem = new WorkMessage.AcceptConnection(tcs, connection, userId, username, isOwner);

        await RoomLogic.WorkQueue.Writer.WriteAsync(queueItem, cancellationToken);
        return await tcs.Task;
    }

    public ValueTask FireMessage(int connectionId, RentedArray<byte> readBytes, DateTime timeRead, CancellationToken cancellationToken)
    {
        return RoomLogic.WorkQueue.Writer.WriteAsync(new WorkMessage.FireMessage(connectionId, readBytes, timeRead), cancellationToken);
    }

    public ValueTask Disconnect(int connectionId, CancellationToken cancellationToken)
    {
        return RoomLogic.WorkQueue.Writer.WriteAsync(new WorkMessage.Disconnect(connectionId), cancellationToken);
    }

    // TODO(performance): optimize these broadcast routines (hint: the `send` is expensive)

    public void Broadcast(string send)
    {
        var connections = RoomLogic.Connections;

        foreach (var connection in connections)
        {
            connection.send(send);
        }
    }

    public void BroadcastExcept(string send, int exceptConnectionId)
    {
        var connections = RoomLogic.Connections;

        foreach (var connection in connections)
        {
            if (connection.connectionId == exceptConnectionId)
            {
                continue;
            }

            connection.send(send);
        }
    }
}

// by using message passing, we make concurrency easier to think about
// "ah, all of <these> events funnel into the room and get handled sequentially"
// not like the JS runtime underneath can handle events in parallel anyways

public record WorkMessage
{
    public record AcceptConnection(TaskCompletionSource<HostConnection> HostConnection,
        WebSocket WebSocket,
        Guid? UserId,
        string Username,
        bool IsOwner) : WorkMessage;

    public record FireMessage(int ConnectionId, RentedArray<byte> Payload, DateTime TimeRead) : WorkMessage;

    public record Disconnect(int ConnectionId) : WorkMessage;
}

public delegate void OnConnect(HostConnection hostConnection);

public delegate void OnDisconnect(int connectionId);

public delegate Task<bool> OnMessage(int connectionId, string message, long timeSent);

public class RoomLogic : IDisposable
{
    private readonly Room _handle;
    public V8ScriptEngine Engine { get; }

    public Channel<WorkMessage> WorkQueue { get; }

    public List<Timer> Timers { get; set;  }

    public IReadOnlyCollection<HostConnection> Connections { get; private set; } = Array.Empty<HostConnection>();

    // TODO(clean): we should change the architecture of how rooms are managed to not have this complicated
    //   and hard-to-follow graph-like dependency chain
    public RoomStorage RoomStorage { get; set; } = null!;

    private OnConnect _onConnect = null!;
    private OnDisconnect _onDisconnect = null!;
    private OnMessage _onMessage = null!;

    public bool InRoomStorage = true;
    public CancellationTokenSource EventLoopCancellationToken { get; } = new();

    public RoomLogic(Room handle, V8ScriptEngine engine)
    {
        _handle = handle;
        Engine = engine;
        WorkQueue = Channel.CreateUnbounded<WorkMessage>();
    }

    private int _nextConnectionId = 0;

    private void HandleAcceptConnection(WorkMessage.AcceptConnection acceptConnection)
    {
        var connectionId = _nextConnectionId++;

        var hostConnection = new HostConnection(acceptConnection.WebSocket,
            connectionId,
            acceptConnection.UserId,
            acceptConnection.Username,
            acceptConnection.IsOwner);

        try
        {
            _onConnect(hostConnection);
        }
        catch (Exception ex)
        {
            hostConnection.close(ex.Message);
            acceptConnection.HostConnection.SetException(ex);
            return;
        }

        Connections = Connections.Append(hostConnection).ToArray();

        acceptConnection.HostConnection.SetResult(hostConnection);
    }

    private void HandleDisconnect(WorkMessage.Disconnect disconnect)
    {
        Connections = Connections.Where(connection => connection.connectionId != disconnect.ConnectionId).ToArray();

        _onDisconnect(disconnect.ConnectionId);
    }

    private async Task HandleFireMessage(WorkMessage.FireMessage fireMessage)
    {
        using var payload = fireMessage.Payload;

        var message = Encoding.UTF8.GetString(payload.Buffer[..payload.RentedLength]);

        MessagePacketId msg;

        try
        {
            msg = JsonSerializer.Deserialize<MessagePacketId>(message)!;
        }
        catch (JsonException)
        {
            // TODO(logging, metrics): record invalid payload and who it was from
            var connection = Connections.First(connection => connection.connectionId == fireMessage.ConnectionId);
            connection.close("Invalid packet (maybe you don't have permissions for this?)");
            return;
        }

        using var timer = SfgMetrics.OnMessageDurationSummary.NewCustomTimer();

        bool success;
        try
        {
            var timeRead = (long)Math.Floor((fireMessage.TimeRead - DateTime.UnixEpoch).TotalMilliseconds);
            success = await _onMessage(fireMessage.ConnectionId, message, timeRead);
        }
        catch (Exception ex)
        {
            // TODO(logging): log exception that happened while handling packet
            // TODO(metrics): record exception?

            // what do we do when we get an exception?
            // an exception from our onMessage handler signifies some sort of fatally flawed logic
            //
            // BUT, if it's something like making a call to save the world but the database is offline,
            // we don't want to crash the world and potentially lose progress
            // (n.b.: you could say "oh just handle that edgecase then", but what if there are more like it?)
            //
            // so, if a packet fails, we should notify the user ASAP and NOT take down the server
            // TODO(error-handling): notify user about exception

            return;
        }

        if (success)
        {
            // SECURITY: Unbounded labels for Prometheus
            //   This is OK because we have validated the PacketId at this point.
            SfgMetrics.PacketsHandledTotal.WithLabels(msg.PacketId).Inc();
            timer.Observer = SfgMetrics.OnMessageDurationSummary.WithLabels(msg.PacketId);
        }
        else
        {
            SfgMetrics.PacketsHandledTotal.Inc();

            // TODO(metrics): record error packet?

            var connection = Connections.First(connection => connection.connectionId == fireMessage.ConnectionId);
            connection.close("Invalid packet (maybe you don't have permissions for this?)");
        }
    }

    public void Start()
    {
        _onConnect = (connection) => Engine.Script.onConnect(connection);
        _onDisconnect = id => Engine.Script.onDisconnect(id);
        _onMessage = (id, message, timeSent) => {
            // https://github.com/microsoft/ClearScript/issues/182#issuecomment-627365386
            var completionSource = new TaskCompletionSource<bool>();

            Action<bool> onResolved = completionSource.SetResult;
            Action<dynamic> onRejected = error => completionSource.SetException(new Exception(error.toString()));

            Engine.Script.onMessage(id, message, timeSent).then(onResolved, onRejected);

            return completionSource.Task;
        };

        Task.Run(async () => {
            try
            {
                await HandleMessages(EventLoopCancellationToken.Token);
            }
            catch (TaskCanceledException)
            {
                // OK: this is expected
            }
            catch (Exception ex)
            {
                // TODO(logging): inform about failure conditoin
                // TODO(metrics): record failure
            }
            finally
            {
                // something happened to stop the event loop
                // we want to cleanup the room

                // make sure no new connections can access this world
                await RemoveRoomFromRoomStorage();

                // make sure to close outstanding websocket connections
                HandleBacklogOfMessages();

                // cleanup resources
                Dispose();
            }
        });
    }

    private async Task RemoveRoomFromRoomStorage()
    {
        // we may have been called from `RoomKillService`, which makes
        // sure that there are no players before killing the room. if it already
        // removed this room from storage, we don't want acquire another lock and
        // accidentally kill a different room
        if (!InRoomStorage) return;

        using var accessToken = await RoomStorage.CreateToken(_handle.Id, default);
        accessToken.Room = null;
    }

    private void HandleBacklogOfMessages()
    {
        while (WorkQueue.Reader.TryRead(out var message))
        {
            switch (message)
            {
                case WorkMessage.AcceptConnection acceptConnection:
                    acceptConnection.HostConnection.SetException(new ConnectionAbortedException("The room is closing!"));
                    break;

                case WorkMessage.Disconnect: continue;
                case WorkMessage.FireMessage: continue;
                default: throw new ArgumentOutOfRangeException(nameof(message));
            }
        }
    }

    private async Task HandleMessages(CancellationToken cancellationToken)
    {
        while (true)
        {
            // TODO(logging): log if behind on work (check WorkQueue.Reader.Count and see how many messages we have to handle)
            var message = await WorkQueue.Reader.ReadAsync(cancellationToken);

            // TODO(logging): log if a single message handle takes > 100ms or so
            switch (message)
            {
                case WorkMessage.AcceptConnection acceptConnection:
                    HandleAcceptConnection(acceptConnection);
                    break;

                case WorkMessage.Disconnect disconnect:
                    HandleDisconnect(disconnect);
                    break;

                case WorkMessage.FireMessage fireMessage:
                    await HandleFireMessage(fireMessage);
                    break;

                default: throw new ArgumentOutOfRangeException(nameof(message));
            }
        }
    }

    public void Dispose()
    {
        // TODO(correctness): will we still be able to iterate over items in the channel? don't think we'd need to but it'd be nice to know
        foreach (var timer in Timers)
        {
            timer.Dispose();
        }

        Timers.Clear();

        WorkQueue.Writer.Complete();
        Engine.Dispose();
    }

    private class MessagePacketId
    {
        [JsonPropertyName("packetId")]
        public string PacketId { get; set; } = null!;
    }
}
