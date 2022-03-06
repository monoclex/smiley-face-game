using Microsoft.EntityFrameworkCore;
using SFGServer.Services;

namespace SFGServer.Controllers;

public record struct PlayerResponse(string Name, EnergyInfo Energy, World[] OwnedWorlds);

// TODO: energy info + world stuff can be in 'models'
public record struct EnergyInfo(int Energy, int MaxEnergy, int EnergyRegenerationRateMs, int LastEnergyAmount, long TimeEnergyWasAtAmount);
// uhh i think havaing 'type' here is stupid
public record struct World(string Type, Guid Id, string Name, int PlayerCount);

// did not work as a record struct, probably because of CoW behavior of structs
public class PlayerRequest
{
    [FromClaim(TokenSigner.UserIdClaimKey, IsRequired = true)]
    public Guid UserId { get; set; }
}

public class PlayerEndpoint : Endpoint<PlayerRequest, PlayerResponse>
{
    private readonly SfgContext _sfgContext;

    public PlayerEndpoint(SfgContext sfgContext)
    {
        _sfgContext = sfgContext;
    }

    public override void Configure()
    {
        Get("/player");
    }

    public override async Task HandleAsync(PlayerRequest req, CancellationToken ct)
    {
        var account = await _sfgContext.Accounts
            .Include(account => account.Worlds)
            .FirstOrDefaultAsync(account => account.Id == req.UserId, ct);

        if (account == null)
        {
            // TODO(logging): record extremely unusual error
            AddError("Could not find account!");
            await SendErrorsAsync(ct);
            return;
        }

        await SendAsync(new PlayerResponse
        {
            Name = account.Username,
            Energy = new EnergyInfo
            {
                Energy = account.GetEnergyAt(DateTime.UtcNow),
                MaxEnergy = account.MaxEnergy,
                EnergyRegenerationRateMs = account.EnergyRegenerationRateMs,
                LastEnergyAmount = account.LastEnergyAmount,
                TimeEnergyWasAtAmount = account.TimeEnergyWasAtAmount
            },
            OwnedWorlds = account.Worlds.Select(world => new World()
            {
                // TODO(api-revision): remove `type: "saved"` from api
                Type = "saved",
                Id = world.Id,
                Name = world.Name,
                // TODO(javascript): get player count of world
                PlayerCount = 0
            }).ToArray()
        }, cancellation: ct);
    }
}
