using SFGServer.Game.HostStructures;
using SFGServer.Game.Services;

namespace SFGServer.Game.SavingBehavior;

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
        return _generateBlankWorldService.GenerateWorld(_width, _height);
    }

    public Task Save(HostWorldData worldData)
    {
        return Task.CompletedTask;
    }

    public Task<bool> IsOwner(Guid userId)
    {
        return Task.FromResult(false);
    }
}
