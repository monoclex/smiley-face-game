import type { ZPacket, ZPacketValidator } from "@smiley-face-game/api";
import { zPacket } from "@smiley-face-game/api";
import Connection from "../worlds/Connection";
import RoomLogic from "./logic/RoomLogic";
import type { ZHeaps, ZWorldBlocks, ZWorldDetails } from "@smiley-face-game/api/types";
import loadWorldData from "./loadWorldData";

type RoomStatus = "starting" | "running" | "stopping" | "stopped";

function wrap<T>(it: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => it().then(resolve, reject));
}

export default class Room {
  get id(): string {
    return this.hostRoom.id;
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

  #status!: RoomStatus;
  #logic!: RoomLogic;
  #worldPacketValidator!: ZPacketValidator;

  constructor(readonly hostRoom: HostRoom) {}

  run(worldData: HostWorldData) {
    this.#status = "starting";

    let blocks: ZWorldBlocks, heap: ZHeaps;
    let details: ZWorldDetails;

    const worldSize = { x: this.hostRoom.width, y: this.hostRoom.height };
    const formatLoader = loadWorldData(worldSize, worldData);

    blocks = formatLoader.world.state;
    heap = formatLoader.heap.state;
    details = {
      height: this.hostRoom.height,
      name: this.hostRoom.name,
      owner: this.hostRoom.ownerUsername,
      ownerId: this.hostRoom.ownerId,
      width: this.hostRoom.width,
    };

    this.#name = this.hostRoom.name;
    this.#width = this.hostRoom.width;
    this.#height = this.hostRoom.height;

    this.#worldPacketValidator = zPacket(this.width - 1, this.height - 1);

    this.#logic = new RoomLogic(blocks, heap, details, this.id, this.hostRoom);

    // world owners should've saved their worlds if they wanted to
    // await this.saveBlocks(blocks);
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
