using Microsoft.EntityFrameworkCore;
using SFGServer.DAL;
using SFGServer.Game.Services;
using SFGServer.Models;
using SFGServer.Services;

namespace SFGServer.Game;

public interface ISavingBehavior
{
    Task<HostWorldData> Load();
    Task Save(HostWorldData worldData);
}

public class SavedWorldSavingBehavior : ISavingBehavior
{
    private readonly IScopedServiceFactory<SfgContext> _serviceFactory;
    private readonly RoomId _roomId;

    public SavedWorldSavingBehavior(IScopedServiceFactory<SfgContext> serviceFactory,  RoomId roomId)
    {
        _serviceFactory = serviceFactory;
        _roomId = roomId;
    }

    public async Task<HostWorldData> Load()
    {
        using var scope = _serviceFactory.CreateScopedService();

        var world = await scope.Service.Worlds.FirstAsync(world => world.Id == _roomId.Id);

        return new HostWorldData(world.WorldDataVersion, world.RawWorldData);
    }

    public async Task Save(HostWorldData worldData)
    {
        using var scope = _serviceFactory.CreateScopedService();

        var world = await scope.Service.Worlds.FirstAsync(world => world.Id == _roomId.Id);

        world.WorldDataVersion = worldData.worldDataVersion;
        world.RawWorldData = worldData.worldData;

        await scope.Service.SaveChangesAsync();
    }
}

public class DynamicWorldSavingBehavior : ISavingBehavior
{
    private readonly GenerateBlankWorldService _generateBlankWorldService;
    private readonly int _width;
    private readonly int _height;

    public DynamicWorldSavingBehavior(GenerateBlankWorldService generateBlankWorldService, int width, int height)
    {
        _generateBlankWorldService = generateBlankWorldService;
        _width = width;
        _height = height;
    }

    public Task<HostWorldData> Load()
    {
        return Task.FromResult(_generateBlankWorldService.GenerateWorld(_width, _height));
    }

    public Task Save(HostWorldData worldData)
    {
        return Task.CompletedTask;
    }
}
