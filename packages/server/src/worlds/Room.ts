import { WorldPacket, WorldPacketValidator } from "@smiley-face-game/api/packets/WorldPacket";
import { WorldDetails } from "@smiley-face-game/api/schemas/web/game/ws/WorldDetails";
import { TileId } from "@smiley-face-game/api/src/schemas/TileId";
import PromiseCompletionSource from "@/concurrency/PromiseCompletionSource";
import WorldRepo from "@/database/repos/WorldRepo";
import Connection from "@/websockets/Connection";
import Dependencies from "@/dependencies";
import RoomLogic from "./logic/RoomLogic";
import generateWorld from "./generateWorld";
import { worldPacket } from "../../../api/src/packets/WorldPacket";
import { blockPosition } from "../../../api/src/schemas/BlockPosition";

type RoomStatus = "starting" | "running" | "stopping" | "stopped";

export default class Room {
  get id(): string { return this.#details.id!; }
  get status(): RoomStatus { return this.#status; }
  // TODO: get these from an actual source
  get width(): number { return 50; }
  get height(): number { return 50; }
  get validateWorldPacket(): WorldPacketValidator { return this.#worldPacketValidator; }

  readonly onRunning: PromiseCompletionSource<void>;
  readonly onStopped: PromiseCompletionSource<void>;
  readonly #details: WorldDetails;
  readonly #repo: WorldRepo;
  readonly #deps: Dependencies;
  #status!: RoomStatus;
  #onEmpty: PromiseCompletionSource<void>;
  #logic!: RoomLogic;
  #worldPacketValidator!: WorldPacketValidator

  constructor(details: WorldDetails, deps: Dependencies) {
    this.onRunning = new PromiseCompletionSource<void>();
    this.onStopped = new PromiseCompletionSource<void>();
    this.#deps = deps;
    this.#details = details;
    this.#repo = deps.worldRepo;
    this.#onEmpty = new PromiseCompletionSource<void>();

    this.run();
  }

  private async run() {
    this.#status = "starting";
    const blocks = await this.getBlocks();

    this.#worldPacketValidator = worldPacket(blockPosition(this.width - 1, this.height - 1).BlockPositionSchema).validateWorldPacket;

    this.#status = "running";
    this.#logic = new RoomLogic(this.#onEmpty, blocks, this.#deps);
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

  join(connection: Connection): boolean {
    if (this.#logic === undefined) {
      console.error("welp this hit somehow, @/worlds/Room.ts Room.join(Connection)");
      throw new Error("this.#logic should never be undefined when calling `join`");
    }

    return this.#logic.handleJoin(connection);
  }

  leave(connection: Connection) {
    if (this.#logic === undefined) {
      console.error("welp this hit somehow, @/worlds/Room.ts Room.leave(Connection)");
      throw new Error("this.#logic should never be undefined when calling `leave`");
    }

    this.#logic.handleLeave(connection);
  }

  onMessage(connection: Connection, packet: WorldPacket) {
    return this.#logic.handleMessage(connection, packet);
  }
}