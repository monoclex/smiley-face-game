using Microsoft.EntityFrameworkCore;
using SFGServer.DAL;
using SFGServer.Game.HostStructures;
using SFGServer.Models;

namespace SFGServer.Game.Services;

public class WorldSaver
{
    private readonly SfgContext _sfgContext;

    public WorldSaver(SfgContext sfgContext)
    {
        _sfgContext = sfgContext;
    }

    public async Task Save(RoomId roomId, HostWorldData hostWorldData)
    {
        var world = await _sfgContext.Worlds.FirstAsync(world => world.Id == roomId.Id);

        world.WorldDataVersion = hostWorldData.worldDataVersion;
        world.RawWorldData = hostWorldData.worldData;

        await _sfgContext.SaveChangesAsync();
    }

    public async Task<HostWorldData> Load(RoomId roomId)
    {
        var world = await _sfgContext.Worlds.FirstAsync(world => world.Id == roomId.Id);

        return new HostWorldData(world.WorldDataVersion, world.RawWorldData);
    }

    public async Task<Guid> GetOwner(RoomId roomId, CancellationToken cancellationToken)
    {
        var world = await _sfgContext.Worlds.FirstAsync(world => world.Id == roomId.Id, cancellationToken);
        var owner = world.OwnerId;

        if (owner == null)
        {
            throw new InvalidOperationException("Saved worlds must always have an owner!");
        }

        return owner.Value;
    }
}
