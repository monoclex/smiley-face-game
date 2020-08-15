import { WorldDetails } from "@smiley-face-game/api/schemas/web/game/ws/WorldDetails";
import { TileId } from "@smiley-face-game/api/src/schemas/TileId";
import PromiseCompletionSource from "@/concurrency/PromiseCompletionSource";
import WorldRepo from "@/database/repos/WorldRepo";
import Dependencies from "@/dependencies";
import generateWorld from "./generateWorld";

type RoomStatus = "starting" | "running" | "stopping" | "stopped";

type UsedDependencies = Pick<Dependencies, "worldRepo">;

export default class Room {
  get id(): string { return this.#details.id!; }
  get status(): RoomStatus { return this.#status; }

  readonly onRunning: PromiseCompletionSource<void>;
  readonly onStopped: PromiseCompletionSource<void>;
  readonly #details: WorldDetails;
  readonly #repo: WorldRepo;
  #status!: RoomStatus;
  #onEmpty: PromiseCompletionSource<void>;

  constructor(details: WorldDetails, deps: UsedDependencies) {
    this.onRunning = new PromiseCompletionSource<void>();
    this.onStopped = new PromiseCompletionSource<void>();
    this.#details = details;
    this.#repo = deps.worldRepo;
    this.#onEmpty = new PromiseCompletionSource<void>();

    this.run();
  }

  private async run() {
    this.#status = "starting";
    const blocks = await this.getBlocks();

    this.#status = "running";
    this.onRunning.resolve();

    await this.#onEmpty.promise;

    this.#status = "stopping";
    await this.saveBlocks(blocks);

    this.#status = "stopped";
    this.onStopped.resolve();
  }

  private async getBlocks(): Promise<{ id: TileId }[][][]> {
    if (this.#details.type === "saved") {
      const world = await this.#repo.findById(this.id);
      return world.worldData;
    }
    else {
      return JSON.parse(generateWorld(this.#details.width, this.#details.height));
    }
  }

  private async saveBlocks(blocks: { id: TileId }[][][]): Promise<void> {
    const world = await this.#repo.findById(this.id);
    world.worldData = blocks;
    await this.#repo.save(world);
  }
}