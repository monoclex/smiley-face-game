using Microsoft.ClearScript.V8;
using Microsoft.Extensions.Options;
using SFGServer.Game.HostStructures;
using SFGServer.Settings;

namespace SFGServer.Game.Services;

public class GenerateBlankWorldService
{
    private readonly JavaScriptCodeSettings _javaScriptCodeSettings;

    public GenerateBlankWorldService(IOptions<JavaScriptCodeSettings> javaScriptCodeSettings)
    {
        _javaScriptCodeSettings = javaScriptCodeSettings.Value;
    }

    public async Task<HostWorldData> GenerateWorld(int width, int height, CancellationToken cancellationToken = default)
    {
        // re-read the code from disk so that hot reloading works
        var code = await File.ReadAllTextAsync(_javaScriptCodeSettings.WorldGenerationCodePath, cancellationToken);

        var engine = new V8ScriptEngine();
        engine.Execute(code);

        var unknown = engine.Script.generateBlankWorld(width, height);
        var hostWorldData = new HostWorldData(unknown.worldDataVersion, unknown.worldData);

        return hostWorldData;
    }
}
