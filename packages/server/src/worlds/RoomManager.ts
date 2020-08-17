import { validateWorldJoinRequest } from "@smiley-face-game/api/schemas/web/game/ws/WorldJoinRequest";
import { WorldJoinRequest } from "@smiley-face-game/api/schemas/web/game/ws/WorldJoinRequest";
import PromiseCompletionSource from "@/concurrency/PromiseCompletionSource";
import MPSC from "@/concurrency/MPSC";
import Connection from "@/worlds/Connection";
import Dependencies from "@/dependencies";
import UuidGenerator from "@/UuidGenerator";
import Room from "./Room";
import ensureValidates from "../ensureValidates";
import SavedBehaviour from "./behaviour/SavedBehaviour";
import DynamicBehaviour from "./behaviour/DynamicBehaviour";

interface JoinRoomRequest {
  connection: Connection;
  roomDetails: WorldJoinRequest;
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

  *listRooms() {
    for (const room of this.#savedRooms.values()) {
      if (room.status === "starting" || room.status === "running") {
        yield { room, type: "saved" as const };
      }
    }
    
    for (const room of this.#dynamicRooms.values()) {
      if (room.status === "starting" || room.status === "running") {
        yield { room, type: "dynamic" as const };
      }
    }
  }

  join(connection: Connection, roomDetails: WorldJoinRequest): Promise<Room> {
    const completion = new PromiseCompletionSource<Room>();

    this.#queue.send({ connection, roomDetails, completion });

    return completion.promise;
  }

  private async lifetime() {
    while (true) {
      const message = await this.#queue.next();
      const room = this.roomFor(message.roomDetails);

      if (room === undefined) {
        message.completion.reject();
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
        this.#savedRooms.delete(room.id);
        const newRoom = this.roomFor(message.roomDetails);

        if (newRoom === undefined) {
          message.completion.reject();
          continue;
        }

        // must wait for the room to start
        await newRoom.onRunning.promise;

        // TODO: should we reuse the code in the "running" case?
        message.completion.resolve(room);
        continue;
      }

      console.warn('possibly unhandled message', message);
    }
  }

  private roomFor(details: WorldJoinRequest): Room | undefined {
    ensureValidates(validateWorldJoinRequest, details);
    // TODO: this is omega wtf, surely there's a better way
    
    if (details.type === "saved") {
      const room = this.#savedRooms.get(details.id);

      if (room === undefined) {
        // "what if the room doesn't exist?" that's handled by room's run() function
        const newRoom = new Room(new SavedBehaviour(this.#deps.worldRepo, details.id));
        this.#savedRooms.set(details.id, newRoom);
        return newRoom;
      }
      else {
        return room;
      }
    }
    else if (details.type === "dynamic") {

      if ("id" in details) {
        const room = this.#dynamicRooms.get(details.id);
  
        if (room === undefined) {
          return undefined;
        }
  
        return room;
      }
      else {
        const id = this.#generator.genIdForDynamicWorld();
        const newRoom = new Room(new DynamicBehaviour(details, id));
        this.#dynamicRooms.set(id, newRoom);
        return newRoom;
      }
    }
    else {
      // unexpected path
      return undefined;
    }
  }
}
