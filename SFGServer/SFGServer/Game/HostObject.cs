// ReSharper disable InconsistentNaming
namespace SFGServer.Game;

public class HostObject
{
    public string greet(string name)
    {
        Console.WriteLine("We are greeting " + name);
        return "Hello, " + name + "!";
    }
}
