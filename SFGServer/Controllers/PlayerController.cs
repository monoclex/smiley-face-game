using Microsoft.AspNetCore.Mvc;

namespace SFGServer.Controllers;

public record PlayerResponse(string Name, EnergyInfo Energy, World[] OwnedWorlds);

// TODO: energy info + world stuff can be in 'models'
public record EnergyInfo(int Energy, int MaxEnergy, int EnergyRegenerationRateMs, int LastEnergyAmount, int TimeEnergyWasAtAAmount);
// uhh i think havaing 'type' here is stupid
public record World(string Type, string Id, string Name, int PlayerCount);

// TODO: needs JWT authorization
[ApiController]
[Route("v1/[controller]")]
public class PlayerController : ControllerBase
{
    [HttpGet]
    public PlayerResponse LoadPlayerInfo()
    {
        throw new NotImplementedException();
    }
}
