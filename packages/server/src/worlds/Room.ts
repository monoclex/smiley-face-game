import type { ZPacket, ZPacketValidator } from "@smiley-face-game/api";
import { zPacket } from "@smiley-face-game/api";
import PromiseCompletionSource from "../concurrency/PromiseCompletionSource";
import Connection from "../worlds/Connection";
import Behaviour from "./behaviour/Behavior";
import RoomLogic from "./logic/RoomLogic";
import type { ZHeaps, ZWorldBlocks, ZWorldDetails } from "@smiley-face-game/api/types";

type RoomStatus = "starting" | "running" | "stopping" | "stopped";

function wrap<T>(it: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => it().then(resolve, reject));
}

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

    let blocks: ZWorldBlocks, heap: ZHeaps;
    let details: ZWorldDetails;

    try {
      const loadBoth = () => {
        // in async code, treating Promise<T>s as Task<T>s/Future<T>s makes the node
        // runtime think that they're unhandled promise rejections.
        //
        // so we have to dip into synchronous code to treat them as handles before
        // reaching an await point
        const blocks = this.#behaviour.loadBlocks().then(([a, b]) => [a.state, b.state] as const);
        const details = this.#behaviour.loadDetails();

        return Promise.all([blocks, details]);
      };

      [[blocks, heap], details] = await loadBoth();
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
    this.#logic = new RoomLogic(
      this.#onEmpty,
      blocks,
      heap,
      details,
      () => (this.#status = "stopping"),
      this.id,
      this.#behaviour
    );
    this.onRunning.resolve();

    await this.#onEmpty.promise;

    this.#status = "stopping";
    // world owners should've saved their worlds if they wanted to
    // await this.saveBlocks(blocks);

    this.#status = "stopped";
    this.onStopped.resolve();
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
