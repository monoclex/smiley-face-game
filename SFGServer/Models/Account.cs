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

    public int GetEnergyAt(DateTime time)
    {
        var millisecondsSinceUnixEpoch = (long)time.Subtract(DateTime.UnixEpoch).TotalMilliseconds;
        var millisecondsEnergyHasBeenRegenerating = millisecondsSinceUnixEpoch - TimeEnergyWasAtAmount;
        var amountOfRegeneratedEnergyPrecise = (double)millisecondsEnergyHasBeenRegenerating / EnergyRegenerationRateMs;
        var amountOfRegeneratedEnergy = (int)Math.Floor(amountOfRegeneratedEnergyPrecise);

        return Math.Min(amountOfRegeneratedEnergy, MaxEnergy);
    }

    public void SetEnergyAt(DateTime time, int energyAmount)
    {
        var millisecondsSinceUnixEpoch = (long)time.Subtract(DateTime.UnixEpoch).TotalMilliseconds;
        var millisecondsEnergyHasBeenRegenerating = millisecondsSinceUnixEpoch - TimeEnergyWasAtAmount;
        var amountOfRegeneratedEnergyPrecise = Math.Min(MaxEnergy, (double)millisecondsEnergyHasBeenRegenerating / EnergyRegenerationRateMs);
        var exactRemains = amountOfRegeneratedEnergyPrecise % 1.0d;
        var timeSpentGeneratingPartialEnergy = exactRemains * EnergyRegenerationRateMs;

        var nowWithRemains = millisecondsSinceUnixEpoch - timeSpentGeneratingPartialEnergy;

        LastEnergyAmount = energyAmount;
        TimeEnergyWasAtAmount = (long)nowWithRemains;
    }
}
