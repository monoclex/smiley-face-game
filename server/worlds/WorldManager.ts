import { RoomId } from "../libcore/core/models/RoomId.ts";
import { WorldPreview } from "../libcore/core/models/WorldPreview.ts";
import { World } from "./World.ts";

export class WorldManager {
  private readonly _worlds: Map<RoomId, World> = new Map<RoomId, World>();

  listGames(): WorldPreview[] {
    let worlds: WorldPreview[] = [];

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
    let createdWorld = new World(
      width,
      height,
      (() => {
        this._worlds.delete(id);
      }).bind(this)
    );

    this._worlds.set(id, createdWorld);

    return createdWorld;
  }
}
