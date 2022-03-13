using Microsoft.ClearScript.V8;
using SFGServer.Contracts.Requests;
using SFGServer.DAL;
using SFGServer.Game.HostStructures;
using SFGServer.Game.SavingBehavior;
using SFGServer.Services;
using SFGServer.Settings;

namespace SFGServer.Game.Services;

public class CreateDynamicRoomService
{
    private readonly StartRoomService _startRoomService;
    private readonly GenerateBlankWorldService _generateBlankWorldService;
    private readonly GenerateWorldIdService _generateWorldIdService;

    public CreateDynamicRoomService(StartRoomService startRoomService,
        GenerateBlankWorldService generateBlankWorldService,
        GenerateWorldIdService generateWorldIdService)
    {
        _startRoomService = startRoomService;
        _generateBlankWorldService = generateBlankWorldService;
        _generateWorldIdService = generateWorldIdService;
    }

    public async Task<Room> Create(string ownerUsername, WebsocketJoin.Create create, CancellationToken cancellationToken)
    {
        var savingBehavior = new DynamicWorldSavingBehavior(_generateBlankWorldService, create.Width, create.Height);

        var id = _generateWorldIdService.GenerateDynamicWorldId();

        var hostRoom = new HostRoom(
            roomId: id,
            name: create.Name,
            ownerId: null,
            ownerUsername: ownerUsername,
            width: create.Width,
            height: create.Height,
            savingBehavior: savingBehavior
        );

        var room = await _startRoomService.Start(hostRoom, cancellationToken);
        return room;
    }
}
