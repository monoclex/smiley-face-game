using Microsoft.EntityFrameworkCore;
using SFGServer.Contracts.Requests;
using SFGServer.Contracts.Responses;
using SFGServer.DAL;
using SFGServer.DAL.Models;
using SFGServer.Models;

namespace SFGServer.Endpoints;

public class ShopItemsEndpoint : Endpoint<ShopItemsRequest, ShopItemsResponse>
{
    private readonly SfgContext _sfgContext;

    public ShopItemsEndpoint(SfgContext sfgContext)
    {
        _sfgContext = sfgContext;
    }

    public override void Configure()
    {
        Get("/shop/items");
    }

    public override async Task HandleAsync(ShopItemsRequest req, CancellationToken ct)
    {
        var account = await _sfgContext.Accounts
            .Include(account => account.ShopItems)
            .FirstOrDefaultAsync(account => account.Id == req.UserId, ct);

        if (account == null)
        {
            // TODO(logging): it's very odd that they have a valid token for an account that does not exist
            AddError("There is no account associated with your token!");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        await SendAsync(new ShopItemsResponse(
            ShopItemConfiguration.ShopItems
                .Where(shopItem => !shopItem.Removed)
                .Select(shopItem =>
                {
                    var accountItem = account.ShopItems.FirstOrDefault(accountItem => accountItem.ShopItemId == shopItem.Id);

                    return new ShopItemModel(
                        Id: shopItem.Id,
                        Title: shopItem.Title,
                        Description: shopItem.Description,
                        DateIntroduced: shopItem.DateIntroduced,
                        CategoryType: shopItem.CategoryType,
                        Category: shopItem.Category,
                        Limit: shopItem.Limited ? 1 : 0,
                        Owned: accountItem?.Purchased ?? 0,
                        EnergySpent: accountItem?.SpentEnergy ?? 0,
                        EnergyCost: shopItem.EnergyCost,
                        ColumnSpan: shopItem.ColumnSpan
                    );
                })
        ), cancellation: ct);
    }
}
