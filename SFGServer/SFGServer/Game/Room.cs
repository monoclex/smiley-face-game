using System.Collections.Immutable;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Channels;
using Microsoft.ClearScript.V8;
using Namotion.Reflection;
using SFGServer.Game.HostStructures;
using SFGServer.Models;

namespace SFGServer.Game;

public class Room : IDisposable
{
    public RoomId Id => HostRoom.RoomId;

    public string Name => HostRoom.name;

    public int PlayerCount => RoomLogic.Connections.Count;

    public HostRoom HostRoom { get; }

    public RoomLogic RoomLogic { get; }

    public V8ScriptEngine Engine => RoomLogic.Engine;

    public Room(V8ScriptEngine engine, HostRoom hostRoom)
    {
        HostRoom = hostRoom;
        RoomLogic = new RoomLogic(engine);
    }

    public void Dispose()
    {
        RoomLogic.Dispose();
    }

    public async Task<HostConnection> AcceptConnection(WebSocket connection, Guid? userId, string username,
        CancellationToken cancellationToken)
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

    public ValueTask FireMessage(int connectionId, Memory<byte> readBytes, CancellationToken cancellationToken)
    {
        return RoomLogic.WorkQueue.Writer.WriteAsync(new WorkMessage.FireMessage(connectionId, readBytes), cancellationToken);
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

    public record FireMessage(int ConnectionId, Memory<byte> Payload) : WorkMessage;

    public record Disconnect(int ConnectionId) : WorkMessage;
}

public delegate void OnConnect(int connectionId, HostConnection hostConnection);

public delegate void OnDisconnect(int connectionId);

public delegate Task<bool> OnMessage(int connectionId, string message);

public class RoomLogic : IDisposable
{
    public V8ScriptEngine Engine { get; }

    public Channel<WorkMessage> WorkQueue { get; }

    public IReadOnlyCollection<HostConnection> Connections { get; private set; } = Array.Empty<HostConnection>();

    private OnConnect _onConnect = null!;
    private OnDisconnect _onDisconnect = null!;
    private OnMessage _onMessage = null!;

    public RoomLogic(V8ScriptEngine engine)
    {
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

        _onConnect(connectionId, hostConnection);

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
        var message = Encoding.UTF8.GetString(fireMessage.Payload.Span);

        var success = await _onMessage(fireMessage.ConnectionId, message);

        if (!success)
        {
            var connection = Connections.First(connection => connection.connectionId == fireMessage.ConnectionId);
            connection.close("Invalid packet (maybe you don't have permissions for this?)");
        }
    }

    public void Start()
    {
        _onConnect = (id, connection) => Engine.Script.onConnect(connection);
        _onDisconnect = id => Engine.Script.onDisconnect(id);
        _onMessage = (id, message) =>
        {
            // https://github.com/microsoft/ClearScript/issues/182#issuecomment-627365386
            var completionSource = new TaskCompletionSource<bool>();

            Action<bool> onResolved = completionSource.SetResult;
            Action<dynamic> onRejected = error => completionSource.SetException(new Exception(error.toString()));

            Engine.Script.onMessage(id, message).then(onResolved, onRejected);

            return completionSource.Task;
        };

        Task.Run(async () =>
        {
            try
            {
                await HandleMessages();
            }
            catch (TaskCanceledException)
            {
            }
        });
    }

    private async Task HandleMessages()
    {
        while (true)
        {
            var message = await WorkQueue.Reader.ReadAsync();

            try
            {
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
                    default:
                        throw new ArgumentOutOfRangeException(nameof(message));
                }
            }
            catch (Exception exception)
            {
                // TODO(logging): log this fatal exception - errors should not occur when handling event
                //   for now, take down the entire handler
                Console.WriteLine("HandleMessage taken down: " + exception);
                throw;
            }
        }
    }

    public void Dispose()
    {
        // TODO(correctness): will we still be able to iterate over items in the channel? don't think we'd need to but it'd be nice to know
        WorkQueue.Writer.Complete();
    }
}
