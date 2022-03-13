using SFGServer.Models;

namespace SFGServer;

public record ServerShopItemInfo
(
    int Id,
    string Title,
    string Description,
    DateTime DateIntroduced,
    ShopCategory Category,
    ShopItemStatus CategoryType,
    bool Limited,
    int EnergyCost,
    PurchaseWorld Purchase,
    int ColumnSpan = 1,
    bool Removed = false
);

public record PurchaseWorld(uint Width, uint Height);

// TODO(clean): change this to a json configuration file
public static class ShopItemConfiguration
{
    public static ServerShopItemInfo[] ShopItems =
    {
        new ServerShopItemInfo(
            Id: 0,
            Title: "200 x 200 World",
            Description: "what a massively sized world",
            DateIntroduced: DateTime.Parse("Sun, 17 Oct 2021 04:20:00 GMT"),
            Category: ShopCategory.World,
            CategoryType: ShopItemStatus.None,
            Limited: false,
            EnergyCost: 1000,
            Purchase: new PurchaseWorld(200, 200)
        ),
        new ServerShopItemInfo(
            Id: 1,
            Title: "30 x 30",
            Description: "what a small little world",
            DateIntroduced: DateTime.Parse("Sun, 17 Oct 2021 13:37:00 GMT"),
            Category: ShopCategory.World,
            CategoryType: ShopItemStatus.None,
            Limited: false,
            EnergyCost: 72,
            ColumnSpan: 2,
            Purchase: new PurchaseWorld(30, 30)
        ),
        new ServerShopItemInfo(
            Id: 2,
            Title: "6 x 9",
            Description: "a really tiny world just as a test for development (will be deleted later)",
            DateIntroduced: DateTime.Parse("Sun, 17 Oct 2021 00:04:20 GMT"),
            Category: ShopCategory.World,
            CategoryType: ShopItemStatus.None,
            Limited: false,
            EnergyCost: 4,
            Purchase: new PurchaseWorld(6, 9),
            Removed: true
        ),
        new ServerShopItemInfo(
            Id: 3,
            Title: "100 x 100",
            Description: "what a largely sized world",
            DateIntroduced: DateTime.Parse("Sun Feb 13 2022 01:45:41 GMT"),
            Category: ShopCategory.World,
            CategoryType: ShopItemStatus.Featured,
            Limited: false,
            EnergyCost: 250,
            Purchase: new PurchaseWorld(100, 100)
        ),
        new ServerShopItemInfo(
            Id: 4,
            Title: "150 x 150",
            Description: "what a bigly sized world",
            DateIntroduced: DateTime.Parse("Sun Feb 13 2022 01:45:41 GMT"),
            Category: ShopCategory.World,
            CategoryType: ShopItemStatus.Featured,
            Limited: false,
            EnergyCost: 500,
            Purchase: new PurchaseWorld(150, 150)
        ),
    };
}
