using Microsoft.AspNetCore.Mvc;

namespace SFGServer.Controllers;

public record Room(string Id, string Name, int PlayerCount);

public record WebsocketRequest(string Token, string World);

[ApiController]
[Route("v1/[controller]")]
public class GameController : ControllerBase
{
    [HttpGet("/lobby")]
    public Room[] Lobby()
    {
        throw new NotImplementedException();
    }

    [HttpGet("/ws")]
    public async Task Websocket([FromQuery] WebsocketRequest websocketRequest)
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var websocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
        }
        else
        {
            throw new NotImplementedException();
        }
    }
}
