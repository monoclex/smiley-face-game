import { RoomId } from "@smiley-face-game/api/schemas/RoomId";
import { WorldPreview } from "@smiley-face-game/api/schemas/WorldPreview";
import { Repository } from "typeorm";
import { AsyncLock, sleep } from '../misc';
import DbWorld from "../database/models/World";
import { World } from "./World";
import WorldRepo from "@/database/repos/WorldRepo";

export class WorldManager {
  private readonly _savingLock: AsyncLock = new AsyncLock();
  private readonly _saving: RoomId[] = [];

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

  async openOrCreateGame(worldsRepository: WorldRepo, id: RoomId, width: number, height: number): Promise<World> {
    // the point of the lock is to prevent worlds from being created while DB operations are being performed to save a world
    // obviously this can be done more efficiently
    await this._savingLock.acquire();

    // if world is in a "saving" state, it's performing DB operations
    // check back in later
    // please check out down below for more reasoning on this
    if (this._saving.indexOf(id) >= 0) {
      this._savingLock.release();
      console.warn('_saving contains id', id, 'checking back in 2s (maybe deadlock, only if this repeats a lot)');

      // maybe it'll be done in 2 seconds
      await sleep(2000);
      return await this.openOrCreateGame(worldsRepository, id, width, height);
    }

    try {
      const world = this._worlds.get(id);

      // world exists
      if (world !== undefined) {
        return world;
      }

      const dbWorld = await worldsRepository.findById(id);

      // world doesn't exist, create it
      const createdWorld = new World(dbWorld, 25, 25, (() => {
        this._worlds.delete(id);

        // at this point, what would be preferred is to aquire "_savingLock" but if it's awaited, the suspension of a promise trying to
        // execute openOrCreateGame for **this world, the one that's closing** may continue executing and accidentally create another
        // instance of this world that still has the stale data from the DB, and then overwrite the saved data in the DB.
        //
        // so tl;dr the _savingLock can't be asynchronously acquired, so a quick workaround was to ask tasks trying to openOrCreateGames
        // for a world that's closing to lay off for a bit and check if this is done
        this._saving.push(id);

        // i'm not actually sure if we need to acquire _savingLock, but it is being acquired just in case
        this._savingLock.acquire()
          .then(async () => {
            const dbWorld = await worldsRepository.findById(id);

            if (dbWorld === undefined) {
              console.warn('not saving dbworld', id, 'can"t grab it from db lol');
              return;
            }

            dbWorld.worldData = createdWorld._map.map;
            await worldsRepository.save(dbWorld);
          })
          .finally(() => {
            this._savingLock.release();
            this._saving.splice(this._saving.indexOf(id), 1);
          });
      }).bind(this));

      this._worlds.set(id, createdWorld);

      return createdWorld;
    }
    finally {
      this._savingLock.release();
    }
  }
}

const roomManager = new WorldManager();
export default roomManager;