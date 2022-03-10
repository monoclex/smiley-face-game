// ReSharper disable InconsistentNaming
using JetBrains.Annotations;
using SFGServer.Game.SavingBehavior;
using SFGServer.Models;

namespace SFGServer.Game.HostStructures;

public class HostRoom
{
    internal ISavingBehavior SavingBehavior { get; }

    public RoomId RoomId { get; }

    [UsedImplicitly]
    public string id { get; }

    [UsedImplicitly]
    public bool isSavedRoom => SavingBehavior is SavedWorldSavingBehavior;

    [UsedImplicitly]
    public bool isDynamicRoom => SavingBehavior is DynamicWorldSavingBehavior;

    [UsedImplicitly]
    public string name { get; }

    [UsedImplicitly]
    public string? ownerId { get; }

    [UsedImplicitly]
    public string ownerUsername { get; }

    [UsedImplicitly]
    public uint width { get; }

    [UsedImplicitly]
    public uint height { get; }

    public HostRoom(RoomId roomId,
        string name,
        string? ownerId,
        string ownerUsername,
        uint width,
        uint height,
        ISavingBehavior savingBehavior)
    {
        SavingBehavior = savingBehavior;
        RoomId = roomId;
        id = roomId.ToString();
        this.name = name;
        this.ownerId = ownerId;
        this.ownerUsername = ownerUsername;
        this.width = width;
        this.height = height;
    }
}
