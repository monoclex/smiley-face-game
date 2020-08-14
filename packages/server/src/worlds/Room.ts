import WorldRepo from "@/database/repos/WorldRepo";
import MPSC from "@/concurrency/MPSC";
import PromiseCompletionSource from "@/concurrency/PromiseCompletionSource";
import Dependencies from "@/dependencies";
import { WorldPacket } from "../../../api/src/networking/packets/WorldPacket"; // TODO: swap out
import { TileId } from "@smiley-face-game/api/src/schemas/TileId";
import generateWorld from "./generateWorld";
import RoomLogic from "./RoomLogic";

interface RoomDetails {
  readonly id: string;
  readonly hasDatabaseEntry: boolean;
  readonly hintedWidth: number;
  readonly hintedHeight: number;
}

type RoomMessage = JoinRoomMessage | SendMessageRoomMessage | LeaveRoomMessage;

interface JoinRoomMessage {
  readonly action: "join";
  readonly accountId: string;
  readonly clientInbox: MPSC<void>;
  readonly completion: PromiseCompletionSource<Room>;
}

interface SendMessageRoomMessage {
  readonly action: "message";
  readonly playerId: number;
  readonly message: WorldPacket;
}

interface LeaveRoomMessage {
  readonly action: "leave";
  readonly playerId: number;
}

type UsedDependencies = Pick<Dependencies, "worldRepo">;

export default class Room {
  get queue(): MPSC<RoomMessage> { return this.#queue; }
  
  get id(): string { return this.#details.id; }

  readonly #details: RoomDetails;
  readonly #repo: WorldRepo;
  #queue: MPSC<RoomMessage>;

  constructor(details: RoomDetails, deps: UsedDependencies) {
    this.#details = details;
    this.#repo = deps.worldRepo;
    this.#queue = new MPSC<RoomMessage>();

    this.run();
  }

  private async run() {
    const blocks = await this.getBlocks();
    const logic = new RoomLogic(blocks);
    let players = 0;

    while (true) {
      const message = await this.#queue.next();

      if (message.action === "join") {
        // TODO: forward message
        players++;
      }
      else if (message.action === "message") {
        // TODO: forward message
      }
      else if (message.action === "leave") {
        // TODO: forward message
        players--;
      }

      if (players === 0) {
        // nobody's online, begin shutting down the world
        break;
      }
    }

    await logic.onCompletion;

    // TODO: get the blocks of the world, save them into the database

    // now that everything is shut down, let's see if we have any outstanding messages (which must be "join" messages)
    if (this.#queue.peek()) {
      // we do.
      
      // create a new room
      const room = new Room(this.#details, { worldRepo: this.#repo });

      // forward all current messages to the room
      while (true) {
        const message = this.#queue.tryTake();
        if (message === undefined) break;

        room.queue.send(message);
      }

      // we can depend upon the js event loop to not have anything running here so we can safely do this and expect nothing to be in our
      // inbound queue whilst newer messages will only get added to the new room's inbound queue
      //
      // if this wasn't the case, we'd have to have two buffers - one to empty out the current queue into, and another to empty out the
      // incoming messages into, and then concatenate them
      this.#queue = room.queue;

      // TODO: set RoomManager to use the new `Room` instead of this one.
      // ^ it actually doesn't matter though, as this queue is being forwarded to the new room.
    }
  }

  private async getBlocks(): Promise<{ id: TileId }[][][]> {
    if (this.#details.hasDatabaseEntry) {
      const world = await this.#repo.findById(this.id);
      return world.worldData;
    }
    else {
      return JSON.parse(generateWorld(this.#details.hintedWidth, this.#details.hintedHeight));
    }
  }
}