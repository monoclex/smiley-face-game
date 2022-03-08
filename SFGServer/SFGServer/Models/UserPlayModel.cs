namespace SFGServer.Models;

public record UserPlayModel
{
    public virtual Guid? GetUserId() => throw new NotSupportedException();

    public record Guest(string Username) : UserPlayModel
    {
        public override Guid? GetUserId()
        {
            return null;
        }
    }

    public record User(Guid UserId) : UserPlayModel
    {
        public override Guid? GetUserId()
        {
            return UserId;
        }
    }
}
