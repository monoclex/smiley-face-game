using SFGServer.Models;

namespace SFGServer.Contracts.Responses;

public record struct PlayerResponse(string Name, EnergyInfoModel Energy, WorldModel[] OwnedWorlds);
