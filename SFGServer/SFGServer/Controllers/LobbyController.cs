using Microsoft.AspNetCore.Mvc;
using SFGServer.Game;
using SFGServer.Models;

namespace SFGServer.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class GameController : ControllerBase
{
    private readonly RoomStorage _roomStorage;

    public GameController(RoomStorage roomStorage)
    {
        _roomStorage = roomStorage;
    }

    [HttpGet("lobby")]
    public IEnumerable<RoomModel> Lobby()
    {
        return _roomStorage.RoomList
            .Select(room => new RoomModel(room.Id.Id, room.Name, room.PlayerCount))
            .OrderBy(room => room.PlayerCount);
    }
}
