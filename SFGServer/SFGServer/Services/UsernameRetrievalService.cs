using Microsoft.EntityFrameworkCore;
using SFGServer.DAL;
using SFGServer.Models;

namespace SFGServer.Services;

public class UsernameRetrievalService
{
    private readonly SfgContext _sfgContext;

    public UsernameRetrievalService(SfgContext sfgContext)
    {
        _sfgContext = sfgContext;
    }

    public async Task<string> GetUsername(UserPlayModel userPlayModel, CancellationToken cancellationToken = default)
    {
        switch (userPlayModel)
        {
            case UserPlayModel.Guest guest:
                return guest.Username;
            case UserPlayModel.User user:
            {
                var account = await _sfgContext.Accounts.FirstAsync(account => account.Id == user.UserId, cancellationToken);
                return account.Username;
            }
            default:
                throw new ArgumentOutOfRangeException(nameof(userPlayModel), "Unknown authentication type");
        }
    }
}
