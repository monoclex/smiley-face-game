namespace SFGServer.Contracts.Responses.World;

public record struct WorldResponse(string Type, Guid Id, string Name, int PlayerCount);
