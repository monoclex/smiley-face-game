import { validateWorldId } from "@smiley-face-game/api/schemas/WorldId";
import Dependencies from "@/dependencies";
import ensureValidates from "@/ensureValidates";
import MPSC from "@/concurrency/MPSC";
import PromiseCompletionSource from "@/concurrency/PromiseCompletionSource";
import Room from "./Room";
import { exception } from "console";

//! The RoomManager *must* be a thread-safe class, (or in JS's case, concurrently-safe?) and its job is to provide rooms to people who want
//! to join a room, safely.
//!
//! The RoomManager achieves this by using message passing. When a room is requested, a message is sent to it to start up that room.
//! Messages go from the "main event loop" of the RoomManager to individual RoomControllers. Each RoomController has it's own event loop,
//! and will start or stop rooms as it sees fit, and send control signals back to the callers of each message.
//!
//! By architecting in this manner, it makes it immensely easy to move this process out of the main process and into its own process or some
//! other parallel mechanism. It also greatly improves code quality, as there is less locks and the flow of dependenceis is easily visible.

type RoomManagerMessage = JoinRoomMessage | LeaveRoomMessage;

interface JoinRoomMessage {
  action: "join";
  roomId: string;
  accountId: string;
  completion: PromiseCompletionSource<Room>;
}

interface LeaveRoomMessage {
  action: "leave";
  roomId: string;
  playerId: number;
}

export default class RoomManager {
  readonly #deps: Dependencies;
  readonly #queue: MPSC<RoomManagerMessage>;
  readonly #rooms: Map<string, Room>;

  constructor(deps: Dependencies) {
    this.#deps = deps;
    this.#queue = new MPSC<RoomManagerMessage>();
    this.#rooms = new Map<string, Room>();

    this.lifetime();
  }

  private async lifetime() {
    while (true) {
      const message = await this.#queue.next();
      const room = this.roomFor(message.roomId);

      if (message.action === "join") {
        room.queue.send({
          action: "join",
          accountId: message.accountId,
          completion: message.completion,
          clientInbox: undefined as unknown as MPSC<void>, // TODO: proper queue working
        })
      }
      else if (message.action === "leave") {
        room.queue.send({
          action: "leave",
          playerId: message.playerId,
        })
      }
      else {
        throw new Error("unhandled internal roommanager message");
      }
    }
  }

  // TODO: use an actual connection class of some sort
  join(connection: undefined /* Connection */, roomId: string): Promise<Room> {
    const completion = new PromiseCompletionSource<Room>();

    this.#queue.send({
      action: "join",
      roomId,
      accountId: "",
      completion,
    })

    return completion.promise;
  }

  private roomFor(id: string): Room {
    const room = this.#rooms.get(id);

    // if we don't have a room, we can make one
    if (room === undefined) {
      const newRoom = new Room(id, this.#deps);
      this.#rooms.set(id, newRoom);
      return newRoom;
    }
    else {
      return room;
    }
  }
}
