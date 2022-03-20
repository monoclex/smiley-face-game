using System.Data;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using SFGServer.Contracts.Requests;
using SFGServer.Contracts.Responses;
using SFGServer.DAL;
using SFGServer.DAL.Models;
using SFGServer.Models;
using SFGServer.Services;

namespace SFGServer.Endpoints;

public class BuyShopItemEndpoint : Endpoint<BuyShopItemRequest, BuyShopItemResponse>
{
    private readonly SfgContext _sfgContext;
    private readonly WorldCreatorService _worldCreatorService;

    public BuyShopItemEndpoint(SfgContext sfgContext, WorldCreatorService worldCreatorService)
    {
        _sfgContext = sfgContext;
        _worldCreatorService = worldCreatorService;
    }

    public override void Configure()
    {
        Post("/shop/buy");
    }

    // TODO(refactor): all of the logic is just shoved into this endpoint lol
    // at least it should be pretty straight forward to refactor
    public override async Task HandleAsync(BuyShopItemRequest req, CancellationToken ct)
    {
        var shopItem = ShopItemConfiguration.ShopItems.FirstOrDefault(shopItem => shopItem.Id == req.Id);

        if (shopItem == null || shopItem.Removed)
        {
            AddError(request => request.Id, "Shop item does not exist!");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        await using var transaction = await _sfgContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

        var account = await _sfgContext.Accounts
            .Include(account => account.ShopItems
                .Where(accountShopItem => accountShopItem.ShopItemId == req.Id))
            .FirstOrDefaultAsync(account => account.Id == req.UserId, ct);

        if (account == null)
        {
            // TODO(logging): very strange that token's account does not exist
            // TODO(clean): i swear this check is in like multiple different places, can we abstract this out?
            AddError("Your account does not exist!");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        var spendEnergy = req.SpendEnergy;
        var currentEnergy = account.GetEnergyAt(DateTime.UtcNow);
        if (spendEnergy > currentEnergy)
        {
            AddError(request => request.SpendEnergy, $"You do not have {spendEnergy} energy! You have {currentEnergy} energy!");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        // sanity check that there's 1 db entry per shop item wanting to be purchased
        if (account.ShopItems.Count > 1)
        {
            throw new InvalidOperationException("There should only be 1 shop item db entry per shop item");
        }

        var accountShopItem = account.ShopItems.FirstOrDefault();

        if (accountShopItem == null)
        {
            accountShopItem = new ShopItem()
            {
                Purchased = 0,
                ShopItemId = shopItem.Id,
                SpentEnergy = 0,
                User = account,
            };

            _sfgContext.ShopItems.Add(accountShopItem);
        }

        if (shopItem.Limited && accountShopItem.Purchased >= 1)
        {
            throw new InvalidOperationException("Already purchased this limited item!");
        }

        // now, we calculate how much energy we need to spend

        // `spendEnergy > currentEnergy`, and it's very likely that `currentEnergy <= int.MaxValue`
        // but just as a sanity check:
        if (spendEnergy >= int.MaxValue)
        {
            // TODO(logging): this indicates a severe issue
            throw new InvalidOperationException("You cannot spend that much energy? (How did you even get here?)");
        }

        var energyToSpend = Math.Min(
            shopItem.EnergyCost - accountShopItem.SpentEnergy,
            (int)spendEnergy
        );

        if (energyToSpend < 0)
        {
            // this should only happen if the maximum price of the shop item is adjusted
            var energyToRefund = (uint)-energyToSpend;
            throw new NotImplementedException("Refunding energy to users is not implemented yet!");
        }

        Debug.Assert(currentEnergy >= energyToSpend);

        account.SetEnergyAt(DateTime.UtcNow, (uint)(currentEnergy - energyToSpend));
        accountShopItem.SpentEnergy += energyToSpend;

        if (accountShopItem.SpentEnergy > shopItem.EnergyCost)
        {
            // TODO(logging): this indicates a flaw with our logic, as we should only be spending EXACTLY enough to purchase the item
            throw new InvalidOperationException("Internal flaw with logic!");
        }

        var shouldPurchase = accountShopItem.SpentEnergy == shopItem.EnergyCost;
        if (shouldPurchase)
        {
            // enough energy to purchase it!
            accountShopItem.SpentEnergy = 0;
            accountShopItem.Purchased += 1;
            await HandlePurchaseAction(account, shopItem.Purchase, ct);
        }

        await _sfgContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        // TODO(automapper): we should use auto mapper to map DTOs, FastEndpoint's mapping stuff is weak
        await SendAsync(new BuyShopItemResponse
        {
            Id = shopItem.Id,
            Purchased = shouldPurchase,
            // TODO(clean): this is *slightly modified* but duplicated from ShopItemsEndpoint
            Item = new ShopItemModel(
                Id: shopItem.Id,
                Title: shopItem.Title,
                Description: shopItem.Description,
                DateIntroduced: shopItem.DateIntroduced,
                CategoryType: shopItem.CategoryType,
                Category: shopItem.Category,
                Limit: shopItem.Limited ? 1 : 0,
                Owned: accountShopItem.Purchased,
                EnergySpent: accountShopItem.SpentEnergy,
                EnergyCost: shopItem.EnergyCost,
                ColumnSpan: shopItem.ColumnSpan
            ),
            // TODO(clean): this is duplicated code in PlayerMapper
            PlayerEnergy = new EnergyInfoModel {
                Energy = account.GetEnergyAt(DateTime.UtcNow),
                MaxEnergy = account.MaxEnergy,
                EnergyRegenerationRateMs = account.EnergyRegenerationRateMs,
                LastEnergyAmount = account.LastEnergyAmount,
                TimeEnergyWasAtAmount = account.TimeEnergyWasAtAmount
            }
        }, cancellation: ct);
    }

    private async Task HandlePurchaseAction(Account owner, PurchaseWorld purchaseAction, CancellationToken cancellationToken)
    {
        var (width, height) = purchaseAction;

        await _worldCreatorService.CreateWorld(owner, width, height, cancellationToken);
    }
}
