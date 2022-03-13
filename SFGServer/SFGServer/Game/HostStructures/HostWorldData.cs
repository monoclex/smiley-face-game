// ReSharper disable InconsistentNaming
using JetBrains.Annotations;

namespace SFGServer.Game.HostStructures;

public class HostWorldData
{
    [UsedImplicitly]
    public int worldDataVersion { get; }

    [UsedImplicitly]
    public string worldData { get; }

    public HostWorldData(int worldDataVersion, string worldData)
    {
        this.worldDataVersion = worldDataVersion;
        this.worldData = worldData;
    }
}

