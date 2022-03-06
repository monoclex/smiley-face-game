using SFGServer.Models.Energy;
using SFGServer.Models.World;

namespace SFGServer.Contracts.Responses.Player;

public record struct PlayerResponse(string Name, EnergyInfoModel Energy, WorldModel[] OwnedWorlds);
