namespace SFGServer.Models;

public record UserPlayModel
{
    public record Guest(string Username) : UserPlayModel;

    public record User(Guid UserId) : UserPlayModel;
}
