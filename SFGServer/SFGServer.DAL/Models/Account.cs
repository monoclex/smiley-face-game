namespace SFGServer.DAL.Models;

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

    public virtual ICollection<ShopItem> ShopItems { get; set; } = null!;
    public virtual ICollection<World> Worlds { get; set; } = null!;

    public uint GetEnergyAt(DateTime time)
    {
        var millisecondsSinceUnixEpoch = (long)time.Subtract(DateTime.UnixEpoch).TotalMilliseconds;
        var millisecondsEnergyHasBeenRegenerating = millisecondsSinceUnixEpoch - TimeEnergyWasAtAmount;
        var amountOfRegeneratedEnergyPrecise = (double)millisecondsEnergyHasBeenRegenerating / EnergyRegenerationRateMs;
        var amountOfRegeneratedEnergy = (int)Math.Floor(amountOfRegeneratedEnergyPrecise);
        var energyAtTime = Math.Min(amountOfRegeneratedEnergy, MaxEnergy);

        if (energyAtTime < 0)
        {
            throw new InvalidOperationException("The current energy of the player is negative somehow!");
        }

        return (uint)energyAtTime;
    }

    public void SetEnergyAt(DateTime time, uint energyAmount)
    {
        var millisecondsSinceUnixEpoch = (long)time.Subtract(DateTime.UnixEpoch).TotalMilliseconds;
        var millisecondsEnergyHasBeenRegenerating = millisecondsSinceUnixEpoch - TimeEnergyWasAtAmount;
        var amountOfRegeneratedEnergyPrecise = Math.Min(MaxEnergy, (double)millisecondsEnergyHasBeenRegenerating / EnergyRegenerationRateMs);
        var exactRemains = amountOfRegeneratedEnergyPrecise % 1.0d;
        var timeSpentGeneratingPartialEnergy = exactRemains * EnergyRegenerationRateMs;

        var nowWithRemains = millisecondsSinceUnixEpoch - timeSpentGeneratingPartialEnergy;

        if (energyAmount > int.MaxValue)
        {
            throw new InvalidOperationException("Cannot have more than int.MaxValue energy!");
        }

        LastEnergyAmount = (int)energyAmount;
        TimeEnergyWasAtAmount = (long)nowWithRemains;
    }
}
