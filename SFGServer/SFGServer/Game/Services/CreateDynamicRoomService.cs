using Microsoft.ClearScript.V8;

namespace SFGServer.Game.Services;

public class CreateDynamicRoomService
{
    public async Task<Room> Create(CancellationToken cancellationToken)
    {
        var engine = new V8ScriptEngine();
        engine.AddHostObject("host", new HostObject());

        var script = engine.Compile(await File.ReadAllTextAsync("../../packages/server/dist/app.cjs", cancellationToken));
        engine.Execute(script);

        var world = engine.Evaluate("helloWorld()") as string;
        Console.WriteLine("got world " + world);
        return null;
    }
}
