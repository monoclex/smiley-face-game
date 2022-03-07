namespace SFGServer.Models;

public record struct EnergyInfoModel(int Energy, int MaxEnergy, int EnergyRegenerationRateMs, int LastEnergyAmount, long TimeEnergyWasAtAmount);
