import type { ZWorldDetails } from "@smiley-face-game/common/types";
import WorldRepo from "../../database/repos/WorldRepo";
import type { ZWorldBlocks } from "@smiley-face-game/common/types";
import Behaviour from "./Behavior";
import Connection from "../../worlds/Connection";

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
    return world.worldData;
  }

  async saveBlocks(blocks: ZWorldBlocks): Promise<void> {
    const world = await this.#repo.findById(this.id);
    world.worldData = blocks;
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
