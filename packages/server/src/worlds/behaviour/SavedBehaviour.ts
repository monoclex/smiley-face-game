import { ZWorldDetails, ZWorldBlocks, ZHeap, ZHeaps } from "@smiley-face-game/api/types";
import WorldRepo, { serialize } from "../../database/repos/WorldRepo";
import Behaviour from "./Behavior";
import Connection from "../../worlds/Connection";
import TileJson from "../TileJson";
import { WorldLayer } from "@smiley-face-game/api/game/WorldLayer";
import { FormatLoader } from "@smiley-face-game/api/tiles/format/FormatLoader";
import { loadWorldVersion0 } from "@smiley-face-game/api/tiles/format/WorldDataVersion0";
import { loadWorldVersion1 } from "@smiley-face-game/api/tiles/format/WorldDataVersion1";
import { loadWorldVersion2 } from "@smiley-face-game/api/tiles/format/WorldDataVersion2";

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
      const isOwner = this.#details.ownerId === connection.authTokenPayload.aud;
      connection.hasEdit = isOwner;
      connection.canGod = isOwner;
    }
  }

  async loadBlocks(): Promise<[WorldLayer<number>, WorldLayer<ZHeap | 0>]> {
    const world = await this.#repo.findById(this.id);

    const formatLoader = new FormatLoader(TileJson, { x: world.width, y: world.height });

    if (world.worldDataVersion === 0) {
      //@ts-expect-error /shrug
      loadWorldVersion0(formatLoader, world.worldData);
    }

    if (world.worldDataVersion === 1) {
      //@ts-expect-error /shrug
      loadWorldVersion1(formatLoader, world.worldData);
    }

    if (world.worldDataVersion === 2) {
      //@ts-expect-error /shrug
      loadWorldVersion2(formatLoader, world.worldData);
    }

    return [formatLoader.world, formatLoader.heap];
  }

  async saveBlocks(blocks: ZWorldBlocks, heaps: ZHeaps): Promise<void> {
    const world = await this.#repo.findById(this.id);
    world.worldData = serialize({ x: world.width, y: world.height }, blocks, heaps, TileJson);
    world.worldDataVersion = 2;
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
