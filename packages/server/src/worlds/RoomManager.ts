import PromiseCompletionSource from "@/concurrency/PromiseCompletionSource";
import MPSC from "@/concurrency/MPSC";
import Dependencies from "@/dependencies";
import Room from "./Room";

interface JoinRoomRequest {
  roomId: string;
  accountId: string;
  completion: PromiseCompletionSource<Room>;
}

export default class RoomManager {
  readonly #deps: Dependencies;
  readonly #queue: MPSC<JoinRoomRequest>;
  readonly #rooms: Map<string, Room>;

  constructor(deps: Dependencies) {
    this.#deps = deps;
    this.#queue = new MPSC<JoinRoomRequest>();
    this.#rooms = new Map<string, Room>();

    this.lifetime();
  }

  private async lifetime() {
    while (true) {
      const message = await this.#queue.next();
      const room = this.roomFor(message.roomId);

      if (room.status === "starting") {
        // have to wait until room is running to allow players in
        await room.onRunning.promise;
      }

      if (room.status === "running") {
        // a running room can easily accept players
        // TODO: give player to room
        continue;
      }
      
      if (room.status === "stopping") {
        // have to wait for the room to stop before we can instantiate a new room in the map
        await room.onStopped.promise;
      }

      if (room.status === "stopped") {
        // generate a new room
        this.#rooms.delete(message.roomId);
        const room = this.roomFor(message.roomId);

        // must wait for the room to start
        await room.onRunning.promise;

        // TODO: give player to room
        continue;
      }

      console.warn('possibly unhandled message', message);
    }
  }

  // TODO: use an actual connection class of some sort
  join(connection: undefined /* Connection */, roomId: string): Promise<Room> {
    const completion = new PromiseCompletionSource<Room>();

    this.#queue.send({
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
      // TODO: determine if player is loading one of their rooms
      const newRoom = new Room({ id, hintedWidth: 25, hintedHeight: 25, hasDatabaseEntry: false }, this.#deps);
      this.#rooms.set(id, newRoom);
      return newRoom;
    }
    else {
      return room;
    }
  }
}
