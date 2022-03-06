namespace SFGServer.Models.World;

public record struct WorldModel(string Type, Guid Id, string Name, int PlayerCount);
