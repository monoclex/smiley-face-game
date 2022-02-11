import { ZWorldDetails, ZWorldBlocks, ZHeap, ZHeaps } from "@smiley-face-game/api/types";
import WorldRepo, { serialize } from "../../database/repos/WorldRepo";
import Behaviour from "./Behavior";
import Connection from "../../worlds/Connection";
import TileJson from "../TileJson";
import { BlockStoring } from "@smiley-face-game/api/tiles/storage/BlockStoring";
import { Blocks } from "@smiley-face-game/api/game/Blocks";
import { WorldLayer } from "@smiley-face-game/api/game/WorldLayer";

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

  async loadBlocks(): Promise<[ZWorldBlocks, ZHeaps]> {
    const world = await this.#repo.findById(this.id);

    if (world.worldDataVersion === 0) {
      // uh oh! old version :'( have to upgrade the data to modern stuff
      const oldData = world.worldData as (
        | undefined
        | null
        | { id: 0 }
        | {
            id: 1;
            color?:
              | "white"
              | "black"
              | "brown"
              | "red"
              | "orange"
              | "yellow"
              | "green"
              | "blue"
              | "purple";
          }
        | { id: 2 }
        | { id: 3; rotation: 0 | 1 | 2 | 3 }
        | { id: 4; variant: 0 | 1 | 2 | 3 | 4 }
      )[][][];

      const newData = [];

      for (let l = 0; l < oldData.length; l++) {
        const newLayer = [];

        const layer = oldData[l];
        for (let y = 0; y < layer.length; y++) {
          const newY = [];

          const yMap = layer[y];

          for (let x = 0; x < yMap.length; x++) {
            const block = yMap[x];

            {
              if (block === undefined) newY.push(TileJson.for(0).storing.serialize(0, undefined));
              else if (block === null) newY.push(TileJson.for(0).storing.serialize(0, undefined));
              else if (block.id === 0) newY.push(TileJson.for(0).storing.serialize(0, undefined));
              else if (block.id === 1) {
                const targetCol = block.color || "white";

                let b: BlockStoring<unknown>;
                let l;
                switch (targetCol) {
                  case "white":
                    b = TileJson.for((l = "basic-white")).storing;
                    break;
                  case "brown":
                    b = TileJson.for((l = "basic-brown")).storing;
                    break;
                  case "black":
                    b = TileJson.for((l = "basic-black")).storing;
                    break;
                  case "red":
                    b = TileJson.for((l = "basic-red")).storing;
                    break;
                  case "orange":
                    b = TileJson.for((l = "basic-orange")).storing;
                    break;
                  case "yellow":
                    b = TileJson.for((l = "basic-yellow")).storing;
                    break;
                  case "green":
                    b = TileJson.for((l = "basic-green")).storing;
                    break;
                  case "blue":
                    b = TileJson.for((l = "basic-blue")).storing;
                    break;
                  case "purple":
                    b = TileJson.for((l = "basic-purple")).storing;
                    break;
                }

                newY.push(b.serialize(TileJson.id(l), undefined));
              } else if (block.id === 2) {
                newY.push(TileJson.for("gun").storing.serialize(TileJson.id("gun"), undefined));
              } else if (block.id === 3) {
                const targetRot = block.rotation;

                let b: BlockStoring<unknown>;
                let l;
                switch (targetRot) {
                  case 0:
                    b = TileJson.for((l = "arrow-up")).storing;
                    break;
                  case 1:
                    b = TileJson.for((l = "arrow-right")).storing;
                    break;
                  case 2:
                    b = TileJson.for((l = "arrow-down")).storing;
                    break;
                  case 3:
                    b = TileJson.for((l = "arrow-left")).storing;
                    break;
                }

                newY.push(b.serialize(TileJson.id(l), undefined));
              } else if (block.id === 4) {
                const targetV = block.variant;

                let b: BlockStoring<unknown>;
                let l;
                switch (targetV) {
                  case 0:
                    b = TileJson.for((l = "prismarine-basic")).storing;
                    break;
                  case 1:
                    b = TileJson.for((l = "prismarine-anchor")).storing;
                    break;
                  case 2:
                    b = TileJson.for((l = "prismarine-brick")).storing;
                    break;
                  case 3:
                    b = TileJson.for((l = "prismarine-slab")).storing;
                    break;
                  case 4:
                    b = TileJson.for((l = "prismarine-crystal")).storing;
                    break;
                }

                newY.push(b.serialize(TileJson.id(l), undefined));
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
      const size = { x: world.width, y: world.height };
      const worldData = world.worldData as [number, any][][][];
      const heapData = new WorldLayer<ZHeap | 0>(0);
      const desData: number[][][] = [];

      for (let l = 0; l < worldData.length; l++) {
        const newLayer: number[][] = [];

        const layer = worldData[l];

        if (layer === null || layer === undefined) {
          desData.push(Blocks.makeLayer(size, 0));
          continue;
        }

        for (let y = 0; y < layer.length; y++) {
          const newY: number[] = [];

          const yMap = layer[y];
          if (yMap === null || yMap === undefined) {
            newLayer.push(Blocks.makeYs(size, 0));
            continue;
          }

          for (let x = 0; x < yMap.length; x++) {
            const block = yMap[x];

            if (!block || block.length === 0) newY.push(0);
            else {
              const [sourceId] = block;
              const [id, assoc] = TileJson.forSrc(sourceId).deserialize(block);
              newY.push(id);

              if (assoc) {
                heapData.set(l, x, y, assoc);
              }
            }
          }

          newLayer.push(newY);
        }

        desData.push(newLayer);
      }

      return [desData, heapData.state];
    }

    throw new Error("can't read saved world bocks");
  }

  async saveBlocks(blocks: ZWorldBlocks, heaps: ZHeaps): Promise<void> {
    const world = await this.#repo.findById(this.id);
    world.worldData = serialize({ x: world.width, y: world.height }, blocks, heaps, TileJson);
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
