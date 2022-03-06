using Microsoft.EntityFrameworkCore;
using SFGServer.Contracts.Requests.Player;
using SFGServer.Contracts.Responses.Player;
using SFGServer.DAL;
using SFGServer.Mappers.Register;

namespace SFGServer.Controllers;


public class PlayerEndpoint : Endpoint<PlayerRequest, PlayerResponse, PlayerMapper>
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
        var account = await _sfgContext.Accounts.Include(account => account.Worlds)
            .FirstOrDefaultAsync(account => account.Id == req.UserId, ct);

        if (account == null)
        {
            _logger.LogError("Could not find account with userId '{UserId}'", req.UserId);
            AddError("Could not find account!");
            await SendErrorsAsync(ct);
            return;
        }

        await SendAsync(Map.FromEntity(account), cancellation: ct);
    }
}
