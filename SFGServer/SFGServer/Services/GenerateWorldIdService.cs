using SFGServer.Models;

namespace SFGServer.Services;

public class GenerateWorldIdService
{
    public RoomId GenerateDynamicWorldId()
    {
        return GenWithFirstLetter('d');
    }

    public RoomId GenerateSavedWorld()
    {
        return GenWithFirstLetter('5');
    }

    private static RoomId GenWithFirstLetter(char firstLetter)
    {
        var random = Guid.NewGuid();
        var modified = firstLetter + random.ToString()[1..];
        return new RoomId(Guid.Parse(modified));
    }
}
