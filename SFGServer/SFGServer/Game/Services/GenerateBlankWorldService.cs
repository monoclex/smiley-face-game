using Microsoft.ClearScript.V8;
using SFGServer.Game.HostStructures;
using SFGServer.Settings;

namespace SFGServer.Game.Services;

public class GenerateBlankWorldService
{
    private readonly JavaScriptCodeSettings _javaScriptCodeSettings;

    public GenerateBlankWorldService(JavaScriptCodeSettings javaScriptCodeSettings)
    {
        _javaScriptCodeSettings = javaScriptCodeSettings;
    }

    public async Task<HostWorldData> GenerateWorld(int width, int height, CancellationToken cancellationToken = default)
    {
        // re-read the code from disk so that hot reloading works
        var code = await File.ReadAllTextAsync(_javaScriptCodeSettings.WorldGenerationCodePath, cancellationToken);

        var engine = new V8ScriptEngine();
        engine.Execute(code);

        var function = engine.Evaluate("generateBlankWorld");

        if (function is Func<int, int, HostWorldData> generateBlankWorld)
        {
            return generateBlankWorld(width, height);
        }

        throw new InvalidOperationException("Unable to evaluate `generateBlankWorld`!");
    }
}
