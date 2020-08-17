import { validateWorldJoinRequest } from "@smiley-face-game/api/schemas/web/game/ws/WorldJoinRequest";
import { WorldJoinRequest } from "@smiley-face-game/api/schemas/web/game/ws/WorldJoinRequest";
import { blockPosition } from "@smiley-face-game/api/schemas/BlockPosition";
import { Block } from "@smiley-face-game/api/schemas/Block";
import { worldPacket, WorldPacket, WorldPacketValidator } from "@smiley-face-game/api/packets/WorldPacket";
import PromiseCompletionSource from "@/concurrency/PromiseCompletionSource";
import WorldRepo from "@/database/repos/WorldRepo";
import Connection from "@/worlds/Connection";
import Dependencies from "@/dependencies";
import Behaviour from "./behaviour/Behavior";
import RoomLogic from "./logic/RoomLogic";
import generateWorld from "./generateWorld";
import ensureValidates from "../ensureValidates";

type RoomStatus = "starting" | "running" | "stopping" | "stopped";

export default class Room {
  get id(): string { return this.#behaviour.id; }
  get status(): RoomStatus { return this.#status; }
  get name(): string { return this.#name; }
  // TODO: get these from an actual source
  get width(): number { return this.#width; }
  get height(): number { return this.#height; }
  get validateWorldPacket(): WorldPacketValidator { return this.#worldPacketValidator; }
  get playerCount() { return this.#logic.playerCount };

  #name!: string;
  #width!: number;
  #height!: number;

  readonly onRunning: PromiseCompletionSource<void>;
  readonly onStopped: PromiseCompletionSource<void>;
  readonly #behaviour: Behaviour;
  #status!: RoomStatus;
  #onEmpty: PromiseCompletionSource<void>;
  #logic!: RoomLogic;
  #worldPacketValidator!: WorldPacketValidator;

  constructor(behaviour: Behaviour) {
    this.#behaviour = behaviour;
    this.onRunning = new PromiseCompletionSource<void>();
    this.onStopped = new PromiseCompletionSource<void>();
    this.#onEmpty = new PromiseCompletionSource<void>();

    this.run();
  }

  private async run() {
    this.#status = "starting";

    let blocks;
    let details;

    try {
      const blocksPromise = this.getBlocks();
      const detailsPromise = this.#behaviour.loadDetails();
      const [blocksResult, detailsResult] = await Promise.all([blocksPromise, detailsPromise]);  
      blocks = blocksResult;
      details = detailsResult;
    }
    catch (error) {
      console.error("Couldn't load saved world '", this.id, "': ", error);
      this.#status = "stopping";
      this.onRunning.resolve();
      this.#status = "stopped";
      this.onStopped.resolve();
      return;
    }

    this.#name = details.name;
    this.#width = details.width;
    this.#height = details.height;

    this.#worldPacketValidator = worldPacket(blockPosition(this.width - 1, this.height - 1).BlockPositionSchema).validateWorldPacket;

    this.#status = "running";
    this.#logic = new RoomLogic(this.#onEmpty, blocks, details, () => this.#status = "stopping");
    this.onRunning.resolve();

    await this.#onEmpty.promise;

    this.#status = "stopping";
    await this.saveBlocks(blocks);

    this.#status = "stopped";
    this.onStopped.resolve();
  }

  private getBlocks(): Promise<Block[][][]> {
    return this.#behaviour.loadBlocks();
  }

  private saveBlocks(blocks: Block[][][]): Promise<void> {
    return this.#behaviour.saveBlocks(blocks);
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