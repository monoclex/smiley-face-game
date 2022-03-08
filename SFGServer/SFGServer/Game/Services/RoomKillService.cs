using SFGServer.Models;

namespace SFGServer.Game.Services;

public class RoomKillService
{
    private readonly RoomStorage _roomStorage;

    public RoomKillService(RoomStorage roomStorage)
    {
        _roomStorage = roomStorage;
    }

    public async Task SignalKill(RoomId roomId, CancellationToken cancellationToken = default)
    {
        Room room;

        using (var token = await _roomStorage.CreateToken(roomId, cancellationToken))
        {
            if (token.Room == null)
            {
                // this room id is already dead, that's ok
                return;
            }

            room = token.Room;

            if (room.PlayerCount != 0)
            {
                // there are players playing, don't kill this room
                return;
            }

            // remove this room from room storage immediately so players can't join it
            token.Room = null;
        }

        // lock on room storage is freed,
        // now perform cleanup on the room
        room.Dispose();
    }
}
