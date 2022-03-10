using SFGServer.Models;

namespace SFGServer.Contracts.Responses;

public class BuyShopItemResponse
{
    public int Id { get; set; }

    public bool Purchased { get; set; }

    public ShopItemModel Item { get; set; }

    public EnergyInfoModel PlayerEnergy { get; set; }
}
