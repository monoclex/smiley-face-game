using Microsoft.AspNetCore.Mvc;

namespace SFGServer.Controllers;

public record Room(string Id, string Name, int PlayerCount);

[ApiController]
[Route("v1/[controller]")]
public class GameController : ControllerBase
{
    [HttpGet("/lobby")]
    public Room[] Lobby()
    {
        throw new NotImplementedException();
    }
}
