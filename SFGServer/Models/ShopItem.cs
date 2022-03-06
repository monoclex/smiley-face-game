namespace SFGServer.Models;

public class ShopItem
{
    public int Id { get; set; }
    public int ShopItemId { get; set; }
    public int SpentEnergy { get; set; }
    public int Purchased { get; set; }
    public Guid? UserId { get; set; }

    public virtual Account? User { get; set; }
}
