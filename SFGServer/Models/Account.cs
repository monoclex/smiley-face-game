namespace SFGServer.Models;

public class Account
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public int MaxEnergy { get; set; }
    public int LastEnergyAmount { get; set; }
    public long TimeEnergyWasAtAmount { get; set; }
    public int EnergyRegenerationRateMs { get; set; }

    public virtual ICollection<ShopItem> ShopItems { get; set; }
    public virtual ICollection<World> Worlds { get; set; }
}
