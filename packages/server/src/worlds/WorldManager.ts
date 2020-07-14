import { RoomId } from "@smiley-face-game/api/src/models/RoomId";
import { WorldPreview } from "@smiley-face-game/api/src/models/WorldPreview";
import { World } from "./World";

export class WorldManager {
  private readonly _worlds: Map<RoomId, World> = new Map<RoomId, World>();

  listGames(): WorldPreview[] {
    const worlds: WorldPreview[] = [];

    for (const [id, world] of this._worlds.entries()) {
      worlds.push({
        id,
        playerCount: world.users.size,
      });
    }

    return worlds;
  }

  openOrCreateGame(id: RoomId, width: number, height: number): World {
    const world = this._worlds.get(id);

    // world exists
    if (world !== undefined) {
      return world;
    }

    // world doesn't exist, create it
    const createdWorld = new World(width, height, (() => {
      this._worlds.delete(id);
    }).bind(this));

    this._worlds.set(id, createdWorld);

    return createdWorld;
  }
}
