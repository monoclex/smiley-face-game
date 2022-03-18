using SFGServer.Game.HostStructures;
using SFGServer.Game.Services;

namespace SFGServer.Game.SavingBehavior;

public class DynamicWorldSavingBehavior : ISavingBehavior
{
    private readonly GenerateBlankWorldService _generateBlankWorldService;
    private readonly uint _width;
    private readonly uint _height;

    public DynamicWorldSavingBehavior(GenerateBlankWorldService generateBlankWorldService, uint width, uint height)
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

    public Task<bool> IsOwner(Guid userId, CancellationToken cancellationToken)
    {
        return Task.FromResult(false);
    }
}
