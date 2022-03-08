using Microsoft.ClearScript.V8;
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
    private readonly RoomManager _roomManager;

    public StartRoomService(JavaScriptCodeSettings javaScriptCodeSettings,
        IScopedServiceFactory<WorldSaver> worldSaverFactory,
        RoomManager roomManager)
    {
        _javaScriptCodeSettings = javaScriptCodeSettings;
        _worldSaverFactory = worldSaverFactory;
        _roomManager = roomManager;
    }

    public async Task<Room> Start(HostRoom hostRoom, CancellationToken cancellationToken)
    {
        var code = await File.ReadAllTextAsync(_javaScriptCodeSettings.ServerCodePath, cancellationToken);

        var engine = new V8ScriptEngine();
        var room = new Room(engine, hostRoom);
        var hostObject = new HostObject(_roomManager, room, _worldSaverFactory);

        engine.AddHostObject("host", hostObject);
        engine.Execute(code);

        room.RoomLogic.Start();

        return room;
    }
}
