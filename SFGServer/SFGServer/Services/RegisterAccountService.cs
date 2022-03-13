using Microsoft.EntityFrameworkCore;
using SFGServer.DAL;
using SFGServer.DAL.Models;

namespace SFGServer.Services;

public class RegisterAccountService
{
    private readonly SfgContext _sfgContext;
    private readonly WorldCreatorService _worldCreatorService;

    public RegisterAccountService(SfgContext sfgContext, WorldCreatorService worldCreatorService)
    {
        _sfgContext = sfgContext;
        _worldCreatorService = worldCreatorService;
    }

    public Task<bool> IsUsernameTakenAsync(string username, CancellationToken ct = default)
    {
        return _sfgContext.Accounts.AnyAsync(x => x.Username == username, ct);
    }

    public Task<bool> IsEmailTakenAsync(string email, CancellationToken ct = default)
    {
        return _sfgContext.Accounts.AnyAsync(x => x.Email == email, ct);
    }

    public async Task<(bool success, Account? account)> TryRegisterAsync(string username, string email, string password, CancellationToken ct = default)
    {
        if (await IsUsernameTakenAsync(username, ct))
            return (false, null);

        if (await IsEmailTakenAsync(email, ct))
            return (false, null);


        var utcNowMs = (long)DateTime.UtcNow.Subtract(DateTime.UnixEpoch).TotalMilliseconds;
        var account = _sfgContext.Accounts.Add(new Account {
            Username = username,
            Email = email,
            Password = HashPassword(password),
            MaxEnergy = 100,
            LastEnergyAmount = 100,
            TimeEnergyWasAtAmount = utcNowMs,
            EnergyRegenerationRateMs = (int)TimeSpan.FromMinutes(5).TotalMilliseconds,
        });

        _worldCreatorService.CreateDefaultWorld(account.Entity);

        await _sfgContext.SaveChangesAsync(ct);
        return (true, account.Entity);
    }

    private static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
}
