using Microsoft.ClearScript.JavaScript;
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
    private readonly RoomStorage _roomStorage;

    public StartRoomService(IOptions<JavaScriptCodeSettings> javaScriptCodeSettings,
        IScopedServiceFactory<WorldSaver> worldSaverFactory,
        RoomKillService roomKillService,
        RoomStorage roomStorage)
    {
        _javaScriptCodeSettings = javaScriptCodeSettings.Value;
        _worldSaverFactory = worldSaverFactory;
        _roomKillService = roomKillService;
        _roomStorage = roomStorage;
    }

    public async Task<Room> Start(HostRoom hostRoom, CancellationToken cancellationToken)
    {
        var code = await File.ReadAllTextAsync(_javaScriptCodeSettings.ServerCodePath, cancellationToken);

        var engine = new V8ScriptEngine();
        var room = new Room(engine, hostRoom);
        room.RoomLogic.RoomStorage = _roomStorage;
        var hostObject = new HostObject(_roomKillService, room, _worldSaverFactory);

        engine.AddHostObject("host", hostObject);
        engine.AddHostType(typeof(HostConnection));
        engine.AddHostType(typeof(HostObject));
        engine.AddHostType(typeof(Console));
        engine.AddHostType(typeof(JavaScriptExtensions)); // for .ToPromise()
        engine.Execute(code);

        room.RoomLogic.Start();

        var initialWorldData = await room.HostRoom.SavingBehavior.Load();
        room.RoomLogic.Engine.Script.initialize(room.HostRoom, initialWorldData);

        return room;
    }
}
