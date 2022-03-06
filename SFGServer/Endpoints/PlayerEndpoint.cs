using Microsoft.EntityFrameworkCore;
using SFGServer.Contracts.Requests.Player;
using SFGServer.Contracts.Responses.Energy;
using SFGServer.Contracts.Responses.Player;
using SFGServer.Contracts.Responses.World;
using SFGServer.DAL;

namespace SFGServer.Controllers;


public class PlayerEndpoint : Endpoint<PlayerRequest, PlayerResponse>
{
    private readonly ILogger<PlayerEndpoint> _logger;
    private readonly SfgContext _sfgContext;

    public PlayerEndpoint(ILogger<PlayerEndpoint> logger, SfgContext sfgContext)
    {
        _logger = logger;
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
            _logger.LogError("Could not find account with userId '{UserId}'", req.UserId);
            AddError("Could not find account!");
            await SendErrorsAsync(ct);
            return;
        }

        await SendAsync(new PlayerResponse {
            Name = account.Username,
            Energy = new EnergyInfoResponse {
                Energy = account.GetEnergyAt(DateTime.UtcNow),
                MaxEnergy = account.MaxEnergy,
                EnergyRegenerationRateMs = account.EnergyRegenerationRateMs,
                LastEnergyAmount = account.LastEnergyAmount,
                TimeEnergyWasAtAmount = account.TimeEnergyWasAtAmount
            },
            OwnedWorlds = account.Worlds.Select(world => new WorldResponse() {
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
