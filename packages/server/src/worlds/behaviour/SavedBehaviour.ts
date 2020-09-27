import { WorldDetails } from "@smiley-face-game/api/schemas/WorldDetails";
import WorldRepo from "@/database/repos/WorldRepo";
import WorldBlocks from "@/worlds/WorldBlocks";
import Behaviour from "./Behavior";

export default class SavedBehaviour implements Behaviour {
  #repo: WorldRepo;
  
  readonly id: string;

  constructor(worldRepo: WorldRepo, id: string) {
    this.id = id;
    this.#repo = worldRepo;
  }

  async loadBlocks(): Promise<WorldBlocks> {
    const world = await this.#repo.findById(this.id);
    return world.worldData;
  }

  async saveBlocks(blocks: WorldBlocks): Promise<void> {
    const world = await this.#repo.findById(this.id);
    world.worldData = blocks;
    await this.#repo.save(world);
  }

  async loadDetails(): Promise<WorldDetails> {
    const world = await this.#repo.findById(this.id, { withOwner: true });

    return {
      name: world.name,
      width: world.width,
      height: world.height,
      owner: world.owner.username,
      ownerId: world.owner.id
    };
  }

  async saveDetails(details: WorldDetails): Promise<void> {
    const world = await this.#repo.findById(this.id);

    if (details.width !== world.width) throw new Error("Can't change world width.");
    if (details.height !== world.height) throw new Error("Can't change world height.");

    world.name = details.name;
    await this.#repo.save(world);
  }
}
