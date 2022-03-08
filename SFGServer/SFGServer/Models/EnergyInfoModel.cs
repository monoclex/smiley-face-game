namespace SFGServer.Models;

public record struct EnergyInfoModel(uint Energy, int MaxEnergy, int EnergyRegenerationRateMs, int LastEnergyAmount, long TimeEnergyWasAtAmount);
