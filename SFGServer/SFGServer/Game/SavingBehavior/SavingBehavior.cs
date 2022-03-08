using SFGServer.Game.HostStructures;

namespace SFGServer.Game.SavingBehavior;

public interface ISavingBehavior
{
    Task<HostWorldData> Load();
    Task Save(HostWorldData worldData);
}
