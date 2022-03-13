// ReSharper disable InconsistentNaming

using System.Buffers;
using System.Net.WebSockets;
using System.Text;
using JetBrains.Annotations;
using SFGServer.Game.SavingBehavior;
using SFGServer.Game.Services;
using SFGServer.Services;

namespace SFGServer.Game.HostStructures;

public class HostObject
{
    private readonly RoomKillService _roomKillService;
    private readonly Room _room;
    private readonly IScopedServiceFactory<WorldSaver> _worldSaverFactory;

    public HostObject(RoomKillService roomKillService, Room room, IScopedServiceFactory<WorldSaver> worldSaverFactory)
    {
        _roomKillService = roomKillService;
        _room = room;
        _worldSaverFactory = worldSaverFactory;
    }

    [UsedImplicitly]
    public void broadcast(string send)
    {
        _room.Broadcast(send);
    }

    [UsedImplicitly]
    public void broadcastExcept(string send, int exceptConnectionId)
    {
        _room.BroadcastExcept(send, exceptConnectionId);
    }

    [UsedImplicitly]
    public async Task<HostWorldData> loadWorld()
    {
        using var scope = _worldSaverFactory.CreateScopedService();

        return await scope.Service.Load(_room.Id);
    }

    [UsedImplicitly]
    public async Task saveWorld(dynamic unknown)
    {
        var worldData = new HostWorldData(unknown.worldDataVersion, unknown.worldData);

        using var scope = _worldSaverFactory.CreateScopedService();

        await scope.Service.Save(_room.Id, worldData);
    }

    [UsedImplicitly]
    public void signalKill()
    {
        Task.Run(async () =>
        {
            await _roomKillService.SignalKill(_room.Id);
        });
    }
}
