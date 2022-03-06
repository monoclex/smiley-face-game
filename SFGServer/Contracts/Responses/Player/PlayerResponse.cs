using SFGServer.Contracts.Responses.Energy;
using SFGServer.Contracts.Responses.World;

namespace SFGServer.Contracts.Responses.Player;

public record struct PlayerResponse(string Name, EnergyInfoResponse Energy, WorldResponse[] OwnedWorlds);
