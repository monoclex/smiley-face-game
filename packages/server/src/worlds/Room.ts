import type { ZPacket, ZPacketValidator } from "@smiley-face-game/common";
import { zPacket } from "@smiley-face-game/common";
import PromiseCompletionSource from "../concurrency/PromiseCompletionSource";
import Connection from "../worlds/Connection";
import Behaviour from "./behaviour/Behavior";
import RoomLogic from "./logic/RoomLogic";
import type { ZWorldBlocks } from "@smiley-face-game/common/types";

type RoomStatus = "starting" | "running" | "stopping" | "stopped";

export default class Room {
  get id(): string {
    return this.#behaviour.id;
  }
  get status(): RoomStatus {
    return this.#status;
  }
  get name(): string {
    return this.#name;
  }
  // TODO: get these from an actual source
  get width(): number {
    return this.#width;
  }
  get height(): number {
    return this.#height;
  }
  get validateWorldPacket(): ZPacketValidator {
    return this.#worldPacketValidator;
  }
  get playerCount() {
    return this.#logic.playerCount;
  }

  #name!: string;
  #width!: number;
  #height!: number;

  readonly onRunning: PromiseCompletionSource<void>;
  readonly onStopped: PromiseCompletionSource<void>;
  readonly #behaviour: Behaviour;
  #status!: RoomStatus;
  #onEmpty: PromiseCompletionSource<void>;
  #logic!: RoomLogic;
  #worldPacketValidator!: ZPacketValidator;

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
    } catch (error) {
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

    this.#worldPacketValidator = zPacket(this.width - 1, this.height - 1);

    this.#status = "running";
    this.#logic = new RoomLogic(this.#onEmpty, blocks, details, () => (this.#status = "stopping"), this.id, this.#behaviour);
    this.onRunning.resolve();

    await this.#onEmpty.promise;

    this.#status = "stopping";
    // world owners should've saved their worlds if they wanted to
    // await this.saveBlocks(blocks);

    this.#status = "stopped";
    this.onStopped.resolve();
  }

  private getBlocks(): Promise<ZWorldBlocks> {
    return this.#behaviour.loadBlocks();
  }

  // private saveBlocks(blocks: Block[][][]): Promise<void> {
  //   return this.#behaviour.saveBlocks(blocks);
  // }

  join(connection: Connection): boolean {
    if (this.#logic === undefined) {
      console.error("welp this hit somehow, ../worlds/Room.ts Room.join(Connection)");
      throw new Error("this.#logic should never be undefined when calling `join`");
    }

    return this.#logic.handleJoin(connection);
  }

  leave(connection: Connection) {
    if (this.#logic === undefined) {
      console.error("welp this hit somehow, ../worlds/Room.ts Room.leave(Connection)");
      throw new Error("this.#logic should never be undefined when calling `leave`");
    }

    this.#logic.handleLeave(connection);
  }

  onMessage(connection: Connection, packet: ZPacket) {
    return this.#logic.handleMessage(connection, packet);
  }
}
