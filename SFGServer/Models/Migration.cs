namespace SFGServer.Models;

public class Migration
{
    public int Id { get; set; }
    public long Timestamp { get; set; }
    public string Name { get; set; } = null!;
}
