using Microsoft.EntityFrameworkCore;
using SFGServer.DAL;
using SFGServer.Models;

namespace SFGServer.Game.Services;

public class RoomNameChanger
{
    private readonly SfgContext _sfgContext;

    public RoomNameChanger(SfgContext sfgContext)
    {
        _sfgContext = sfgContext;
    }

    public async Task ChangeName(RoomId roomId, string name)
    {
        var room = await _sfgContext.Worlds.FirstAsync(room => room.Id == roomId.Id);
        room.Name = name;
        await _sfgContext.SaveChangesAsync();
    }
}
