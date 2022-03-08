using SFGServer.Game.HostStructures;
using SFGServer.Game.Services;
using SFGServer.Models;
using SFGServer.Services;

namespace SFGServer.Game.SavingBehavior;

public class SavedWorldSavingBehavior : ISavingBehavior
{
    private readonly IScopedServiceFactory<WorldSaver> _serviceFactory;
    private readonly RoomId _roomId;

    public SavedWorldSavingBehavior(IScopedServiceFactory<WorldSaver> serviceFactory, RoomId roomId)
    {
        _serviceFactory = serviceFactory;
        _roomId = roomId;
    }

    public async Task<HostWorldData> Load()
    {
        using var scope = _serviceFactory.CreateScopedService();
        return await scope.Service.Load(_roomId);
    }

    public async Task Save(HostWorldData worldData)
    {
        using var scope = _serviceFactory.CreateScopedService();
        await scope.Service.Save(_roomId, worldData);
    }
}
