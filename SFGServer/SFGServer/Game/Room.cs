using SFGServer.Models;

namespace SFGServer.Game;

public class Room : IDisposable
{
    public RoomId Id { get; }

    public string Name { get; }

    public int PlayerCount { get; }

    public void Dispose() {}
}
