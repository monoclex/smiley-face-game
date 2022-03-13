namespace SFGServer.DAL.Models;

public class World
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public int Width { get; set; }
    public int Height { get; set; }
    public string RawWorldData { get; set; } = null!;
    public int WorldDataVersion { get; set; }

    public Guid? OwnerId { get; set; }
    public virtual Account? Owner { get; set; }
}
