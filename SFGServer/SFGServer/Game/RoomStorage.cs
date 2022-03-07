using SFGServer.Models;

namespace SFGServer.Game;

public class GuardedAccess : IDisposable
{
    private readonly RoomStorage _roomStorage;

    public GuardedAccess(RoomStorage roomStorage, RoomId roomId, Room? room)
    {
        _roomStorage = roomStorage;
        RoomId = roomId;
        Room = room;
    }

    public RoomId RoomId { get; }
    public Room? Room { get; set; }

    public void Dispose()
    {
        _roomStorage.ReclaimToken(this);
    }
}

public class RoomStorage
{
    private readonly SemaphoreSlim _semaphore = new(0, 1);
    private readonly Dictionary<RoomId, Room> _rooms = new();

    public async Task<GuardedAccess> CreateToken(RoomId roomId, CancellationToken cancellationToken)
    {
        await _semaphore.WaitAsync(cancellationToken);

        _rooms.TryGetValue(roomId, out var room);
        return new GuardedAccess(this, roomId, room);
    }

    public void ReclaimToken(GuardedAccess guardedAccess)
    {
        if (guardedAccess.Room == null)
        {
            _rooms.Remove(guardedAccess.RoomId);
        }
        else
        {
            _rooms[guardedAccess.RoomId] = guardedAccess.Room;
        }

        _semaphore.Release();
    }
}
