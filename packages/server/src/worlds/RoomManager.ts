import PromiseCompletionSource from "../concurrency/PromiseCompletionSource";
import MPSC from "../concurrency/MPSC";
import Connection from "../worlds/Connection";
import Dependencies from "../dependencies";
import UuidGenerator from "../UuidGenerator";
import Room from "./Room";
import ensureValidates from "../ensureValidates";
import SavedBehaviour from "./behaviour/SavedBehaviour";
import DynamicBehaviour from "./behaviour/DynamicBehaviour";
import type { ZJoinRequest } from "@smiley-face-game/api/ws-api";
import { zJoinRequest } from "@smiley-face-game/api/ws-api";

interface JoinRoomRequest {
  connection: Connection;
  roomDetails: ZJoinRequest;
  completion: PromiseCompletionSource<Room>;
}

export default class RoomManager {
  readonly #deps: Dependencies;
  readonly #queue: MPSC<JoinRoomRequest>;
  readonly #rooms: Map<string, Room>;
  readonly #generator: UuidGenerator;

  constructor(deps: Dependencies) {
    this.#deps = deps;
    this.#queue = new MPSC<JoinRoomRequest>();
    this.#rooms = new Map<string, Room>();
    this.#generator = this.#deps.uuidGenerator;

    this.lifetime();
  }

  getSaved(id: string): Room | undefined {
    return this.#rooms.get(id);
  }

  *listRooms() {
    for (const room of this.#rooms.values()) {
      if (room.status === "starting" || room.status === "running") {
        yield { room };
      }
    }
  }

  join(connection: Connection, roomDetails: ZJoinRequest): Promise<Room> {
    const completion = new PromiseCompletionSource<Room>();

    this.#queue.send({ connection, roomDetails, completion });

    return completion.promise;
  }

  private async lifetime() {
    while (true) {
      const message = await this.#queue.next();
      const room = this.roomFor(message.roomDetails);

      if (room === undefined) {
        message.completion.reject(new Error("No room exists with that ID."));
        continue;
      }

      if (room.status === "starting") {
        // have to wait until room is running to allow players in
        await room.onRunning.promise;
      }

      if (room.status === "running") {
        // a running room can easily accept players
        message.completion.resolve(room);
        continue;
      }

      if (room.status === "stopping") {
        // have to wait for the room to stop before we can instantiate a new room in the map
        await room.onStopped.promise;
      }

      if (room.status === "stopped") {
        // generate a new room
        this.#rooms.delete(room.id);
        const newRoom = this.roomFor(message.roomDetails);

        if (newRoom === undefined) {
          message.completion.reject(new Error("No room exists with that ID."));
          continue;
        }

        // must wait for the room to start
        await newRoom.onRunning.promise;

        // TODO: should we reuse the code in the "running" case?
        if (newRoom.status === "running") {
          message.completion.resolve(newRoom);
        } else {
          message.completion.reject(new Error("Room failed to start."));
        }
        continue;
      }

      console.warn("possibly unhandled message", message);
    }
  }

  private roomFor(details: ZJoinRequest): Room | undefined {
    ensureValidates(zJoinRequest, details);
    // TODO: this is omega wtf, surely there's a better way

    if (details.type === "join") {
      const room = this.#rooms.get(details.id);

      if (room === undefined) {
        // "what if the room doesn't exist?" that's handled by room's run() function
        const newRoom = new Room(new SavedBehaviour(this.#deps.worldRepo, details.id));
        this.#rooms.set(details.id, newRoom);
        return newRoom;
      } else {
        return room;
      }
    } else if (details.type === "create") {
      const id = this.#generator.genIdForDynamicWorld();
      const newRoom = new Room(new DynamicBehaviour(details, id));
      this.#rooms.set(id, newRoom);
      return newRoom;
    } else {
      // unexpected path
      return undefined;
    }
  }
}
