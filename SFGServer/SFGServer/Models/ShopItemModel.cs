namespace SFGServer.Models;

// TODO(api-revision): rename CategoryType + Category to match enum name
public record ShopItemModel(int Id,
    string Title,
    string Description,
    DateTime DateIntroduced,
    ShopItemStatus CategoryType,
    ShopCategory Category,
    int Limit,
    // TODO(api-revision): rename Owned to QuantityOwned
    int Owned,
    int EnergySpent,
    int EnergyCost,
    int? ColumnSpan);

[Flags]
public enum ShopItemStatus
{
    None,
    Featured = 1 << 1,
    Owned = 1 << 2,
}

[Flags]
public enum ShopCategory
{
    None,
    World,
    Character,
}
