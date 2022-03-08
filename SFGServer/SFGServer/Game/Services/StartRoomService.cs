using Microsoft.ClearScript.V8;
using Microsoft.Extensions.Options;
using SFGServer.Contracts.Requests;
using SFGServer.Game.HostStructures;
using SFGServer.Game.SavingBehavior;
using SFGServer.Services;
using SFGServer.Settings;

namespace SFGServer.Game.Services;

public class StartRoomService
{
    private readonly JavaScriptCodeSettings _javaScriptCodeSettings;
    private readonly IScopedServiceFactory<WorldSaver> _worldSaverFactory;
    private readonly RoomKillService _roomKillService;

    public StartRoomService(IOptions<JavaScriptCodeSettings> javaScriptCodeSettings,
        IScopedServiceFactory<WorldSaver> worldSaverFactory,
        RoomKillService roomKillService)
    {
        _javaScriptCodeSettings = javaScriptCodeSettings.Value;
        _worldSaverFactory = worldSaverFactory;
        _roomKillService = roomKillService;
    }

    public async Task<Room> Start(HostRoom hostRoom, CancellationToken cancellationToken)
    {
        var code = await File.ReadAllTextAsync(_javaScriptCodeSettings.ServerCodePath, cancellationToken);

        var engine = new V8ScriptEngine();
        var room = new Room(engine, hostRoom);
        var hostObject = new HostObject(_roomKillService, room, _worldSaverFactory);

        engine.AddHostObject("host", hostObject);
        engine.AddHostType(nameof(HostConnection), typeof(HostConnection));
        engine.AddHostType(nameof(HostObject), typeof(HostObject));
        engine.AddHostType(nameof(Console), typeof(Console));
        engine.Execute(code);

        room.RoomLogic.Start();

        var initialWorldData = await room.HostRoom.SavingBehavior.Load();
        room.RoomLogic.Engine.Script.initialize(room.HostRoom, initialWorldData);

        return room;
    }
}
