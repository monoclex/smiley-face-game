using SFGServer.Contracts.Requests;
using SFGServer.Models;
using SFGServer.Game.Services;
using SFGServer.Services;

namespace SFGServer.Game;

public class RoomManager
{
    private readonly RoomStorage _roomStorage;
    private readonly IScopedServiceFactory<LoadSavedRoomService> _loadSavedRoomFactory;
    private readonly CreateDynamicRoomService _createDynamicRoomFactory;

    public RoomManager(RoomStorage roomStorage,
        IScopedServiceFactory<LoadSavedRoomService> loadSavedRoomFactory,
        CreateDynamicRoomService createDynamicRoomFactory)
    {
        _roomStorage = roomStorage;
        _loadSavedRoomFactory = loadSavedRoomFactory;
        _createDynamicRoomFactory = createDynamicRoomFactory;
    }

    public async Task<Room?> JoinRoom(RoomId id, CancellationToken cancellationToken)
    {
        using var token = await _roomStorage.CreateToken(id, cancellationToken);

        if (id.IsSavedWorld())
        {
            if (token.Room != null)
            {
                return token.Room;
            }

            using var scope = _loadSavedRoomFactory.CreateScopedService();

            token.Room = await scope.Service.Load(id, cancellationToken);

            return token.Room;
        }

        if (id.IsDynamicWorld())
        {
            return token.Room;
        }

        throw new ArgumentException("ID is not a saved or dynamic ID!");
    }

    public async Task<Room> CreateDynamicRoom(string ownerUsername, WebsocketJoin.Create create, CancellationToken cancellationToken)
    {
        var room = await _createDynamicRoomFactory.Create(ownerUsername, create, cancellationToken);

        using var token = await _roomStorage.CreateToken(room.Id, cancellationToken);

        if (token.Room != null)
        {
            // TODO: handle this one-in-a-2^128 event
            throw new InvalidOperationException("todo");
        }

        token.Room = room;

        return room;
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
                // there are players playing, don't kill this roo,
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
