using SFGServer.Models;

namespace SFGServer.Contracts.Responses;

public record struct ShopItemsResponse(IEnumerable<ShopItemModel> Items);
