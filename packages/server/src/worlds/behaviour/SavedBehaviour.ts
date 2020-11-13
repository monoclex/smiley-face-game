import type { ZWorldDetails, ZWorldBlocks } from "@smiley-face-game/common/types";
import type Behavior from "@smiley-face-game/common/src/tiles/Behavior";
import WorldRepo, { serialize } from "../../database/repos/WorldRepo";
import Behaviour from "./Behavior";
import Connection from "../../worlds/Connection";
import TileJson from "../TileJson";

export default class SavedBehaviour implements Behaviour {
  #repo: WorldRepo;
  #details: ZWorldDetails | undefined;

  readonly id: string;

  constructor(worldRepo: WorldRepo, id: string) {
    this.id = id;
    this.#repo = worldRepo;
  }

  onPlayerJoin(connection: Connection) {
    if (this.#details === undefined) {
      connection.hasEdit = false;
      console.warn("unable to check details of world");
    } else {
      connection.hasEdit = this.#details.ownerId === connection.authTokenPayload.aud;
    }
  }

  async loadBlocks(): Promise<ZWorldBlocks> {
    const world = await this.#repo.findById(this.id);

    if (world.worldDataVersion === 0) {
      // uh oh! old version :'( have to upgrade the data to modern stuff
      const oldData = world.worldData as (
        | undefined | null | { id: 0 }
        | { id: 1, color?: "white" | "black" | "brown" | "red" | "orange" | "yellow" | "green" | "blue" | "purple" }
        | { id: 2 }
        | { id: 3, rotation: 0 | 1 | 2 | 3 }
        | { id: 4, variant: 0 | 1 | 2 | 3 | 4 }
      )[][][];

      const newData = [];

      for (let l = 0; l < oldData.length; l++) {
        const newLayer = [];

        const layer = oldData[l];
        for (let y = 0; y < layer.length; y++) {
          const newY = [];

          const yMap = layer[y];

          for (let x = 0; x < yMap.length; x++) {
            let block = yMap[x];

            {
              if (block === undefined) newY.push(TileJson.for(0).serialize(0));
              else if (block === null) newY.push(TileJson.for(0).serialize(0));
              else if (block.id === 0) newY.push(TileJson.for(0).serialize(0));
              else if (block.id === 1) {
                const targetCol = block.color || "white";

                let b: Behavior<any>;
                let l;
                switch (targetCol) {
                  case "white": b = TileJson.for(l = "basic-white"); break;
                  case "brown": b = TileJson.for(l = "basic-brown"); break;
                  case "black": b = TileJson.for(l = "basic-black"); break;
                  case "red": b = TileJson.for(l = "basic-red"); break;
                  case "orange": b = TileJson.for(l = "basic-orange"); break;
                  case "yellow": b = TileJson.for(l = "basic-yellow"); break;
                  case "green": b = TileJson.for(l = "basic-green"); break;
                  case "blue": b = TileJson.for(l = "basic-blue"); break;
                  case "purple": b = TileJson.for(l = "basic-purple"); break;
                }

                newY.push(b.serialize(TileJson.id(l)));
              }
              else if (block.id === 2) {
                newY.push(TileJson.for("gun").serialize(TileJson.id("gun")));
              }
              else if (block.id === 3) {
                const targetRot = block.rotation;

                let b: Behavior<any>;
                let l;
                switch (targetRot) {
                  case 0: b = TileJson.for(l = "arrow-up"); break;
                  case 1: b = TileJson.for(l = "arrow-right"); break;
                  case 2: b = TileJson.for(l = "arrow-down"); break;
                  case 3: b = TileJson.for(l = "arrow-left"); break;
                }

                newY.push(b.serialize(TileJson.id(l)));
              }
              else if (block.id === 4) {
                const targetV = block.variant;

                let b: Behavior<any>;
                let l;
                switch (targetV) {
                  case 0: b = TileJson.for(l = "prismarine-basic"); break;
                  case 1: b = TileJson.for(l = "prismarine-anchor"); break;
                  case 2: b = TileJson.for(l = "prismarine-brick"); break;
                  case 3: b = TileJson.for(l = "prismarine-slab"); break;
                  case 4: b = TileJson.for(l = "prismarine-crystal"); break;
                }

                newY.push(b.serialize(TileJson.id(l)));
              }
            }
          }

          newLayer.push(newY);
        }

        newData.push(newLayer);
      }

      world.worldDataVersion = 1;
      world.worldData = newData;
      // await this.#repo.save(world);
    }

    if (world.worldDataVersion === 1) {
      const worldData = world.worldData as (number[])[][][];
      const desData = [];

      for (let l = 0; l < worldData.length; l++) {
        const newLayer = [];

        const layer = worldData[l];
        for (let y = 0; y < layer.length; y++) {
          const newY = [];

          const yMap = layer[y];

          for (let x = 0; x < yMap.length; x++) {
            let block = yMap[x];

            if (block.length === 0) newY.push(0);
            else {
              const [sourceId] = block;
              newY.push(TileJson.forSrc(sourceId).deserialize(block));
            }
          }

          newLayer.push(newY);
        }

        desData.push(newLayer);
      }

      return desData;
    }

    throw new Error("can't read saved world bocks");
  }

  async saveBlocks(blocks: ZWorldBlocks): Promise<void> {
    const world = await this.#repo.findById(this.id);
    world.worldData = serialize(blocks, TileJson);
    world.worldDataVersion = 1;
    await this.#repo.save(world);
  }

  async loadDetails(): Promise<ZWorldDetails> {
    const world = await this.#repo.findById(this.id, { withOwner: true });

    const details = {
      name: world.name,
      width: world.width,
      height: world.height,
      owner: world.owner.username,
      ownerId: world.owner.id,
    };

    this.#details = details;
    return details;
  }

  async saveDetails(details: ZWorldDetails): Promise<void> {
    const world = await this.#repo.findById(this.id);

    if (details.width !== world.width) throw new Error("Can't change world width.");
    if (details.height !== world.height) throw new Error("Can't change world height.");

    world.name = details.name;
    await this.#repo.save(world);
    this.#details = details;
  }
}
