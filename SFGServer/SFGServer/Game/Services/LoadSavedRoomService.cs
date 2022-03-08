using Microsoft.EntityFrameworkCore;
using SFGServer.DAL;
using SFGServer.Game.HostStructures;
using SFGServer.Game.SavingBehavior;
using SFGServer.Models;
using SFGServer.Services;

namespace SFGServer.Game.Services;

public class LoadSavedRoomService
{
    private readonly SfgContext _sfgContext;
    private readonly IScopedServiceFactory<WorldSaver> _serviceFactory;
    private readonly StartRoomService _startRoomService;

    public LoadSavedRoomService(SfgContext sfgContext, IScopedServiceFactory<WorldSaver> serviceFactory, StartRoomService startRoomService)
    {
        _sfgContext = sfgContext;
        _serviceFactory = serviceFactory;
        _startRoomService = startRoomService;
    }

    public async Task<Room?> Load(RoomId roomId, CancellationToken cancellationToken)
    {
        var world = await _sfgContext.Worlds
            .Include(world => world.Owner)
            .FirstOrDefaultAsync(world => world.Id == roomId.Id, cancellationToken);

        if (world == null)
        {
            return null;
        }

        var owner = world.Owner;
        if (owner == null)
        {
            throw new InvalidOperationException("All worlds should have owners!");
        }

        var hostRoom = new HostRoom(
            roomId: new RoomId(world.Id),
            name: world.Name,
            ownerId: owner.Id.ToString(),
            ownerUsername: owner.Username,
            width: world.Width,
            height: world.Height,
            savingBehavior: new SavedWorldSavingBehavior(_serviceFactory, roomId)
        );

        return await _startRoomService.Start(hostRoom, cancellationToken);
    }
}
