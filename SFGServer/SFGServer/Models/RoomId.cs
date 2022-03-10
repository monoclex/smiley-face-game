namespace SFGServer.Models;

public readonly record struct RoomId(Guid Id)
{
    public bool IsDynamicWorld() => Id.ToString()[..1].Equals("d", StringComparison.InvariantCultureIgnoreCase);

    public bool IsSavedWorld() => Id.ToString().StartsWith('5');

    public override string ToString()
    {
        return Id.ToString();
    }
}
