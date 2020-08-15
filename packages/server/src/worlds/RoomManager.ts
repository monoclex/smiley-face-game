import { WorldDetails } from "@smiley-face-game/api/schemas/web/game/ws/WorldDetails";
import PromiseCompletionSource from "@/concurrency/PromiseCompletionSource";
import MPSC from "@/concurrency/MPSC";
import Dependencies from "@/dependencies";
import UuidGenerator from "@/UuidGenerator";
import Room from "./Room";

interface JoinRoomRequest {
  accountId: string;
  room: WorldDetails;
  completion: PromiseCompletionSource<Room>;
}

export default class RoomManager {
  readonly #deps: Dependencies;
  readonly #queue: MPSC<JoinRoomRequest>;
  readonly #savedRooms: Map<string, Room>;
  readonly #dynamicRooms: Map<string, Room>;
  readonly #generator: UuidGenerator;

  constructor(deps: Dependencies) {
    this.#deps = deps;
    this.#queue = new MPSC<JoinRoomRequest>();
    this.#savedRooms = new Map<string, Room>();
    this.#dynamicRooms = new Map<string, Room>();
    this.#generator = this.#deps.uuidGenerator;

    this.lifetime();
  }

  *listRooms(): Iterable<Room> {
    for (const room of this.#savedRooms.values()) {
      if (room.status === "starting" || room.status === "running") {
        yield room;
      }
    }
  }

  join(connection: undefined /* Connection */, details: WorldDetails): Promise<Room> {
    const completion = new PromiseCompletionSource<Room>();

    this.#queue.send({
      accountId: "",
      room: details,
      completion,
    })

    return completion.promise;
  }

  private async lifetime() {
    while (true) {
      const message = await this.#queue.next();
      const room = this.roomFor(message.room);

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
        this.#savedRooms.delete(room.id);
        const newRoom = this.roomFor(message.room);

        // must wait for the room to start
        await newRoom.onRunning.promise;

        // TODO: give player to room
        continue;
      }

      console.warn('possibly unhandled message', message);
    }
  }

  private roomFor(details: WorldDetails): Room {
    // TODO: this is omega wtf, surely there's a better way
    
    if (details.type === "saved") {
      const room = this.#savedRooms.get(details.id);

      if (room === undefined) {
        const newRoom = new Room(details, this.#deps);
        this.#savedRooms.set(details.id, newRoom);
        return newRoom;
      }
      else {
        return room;
      }
    }
    else if (details.type === "dynamic") {
      let roomId = details.id;

      if (roomId === undefined) {
        // must be generating a new world
        roomId = this.#generator.genIdForDynamicWorld();

        // if this ever happens, need to implement more stuff :v (uuid v5 namespace stuff maybe)
        if (this.#dynamicRooms.has(roomId)) throw new Error("UUID collision, is something wrong?");
      }

      details.id = roomId;

      const room = this.#dynamicRooms.get(roomId);

      if (room === undefined) {
        const newRoom = new Room(details, this.#deps);
        this.#dynamicRooms.set(roomId, newRoom);
        return newRoom;
      }
      else {
        return room;
      }
    }
    else {
      throw new Error("unexpected path");
    }
  }
}
