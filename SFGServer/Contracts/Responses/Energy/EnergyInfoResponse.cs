namespace SFGServer.Contracts.Responses.Energy;

public record struct EnergyInfoResponse(int Energy, int MaxEnergy, int EnergyRegenerationRateMs, int LastEnergyAmount, long TimeEnergyWasAtAmount);
