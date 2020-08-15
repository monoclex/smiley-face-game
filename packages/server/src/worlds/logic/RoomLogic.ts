import { WorldPacket } from "@smiley-face-game/api/networking/packets/WorldPacket";
import PromiseCompletionSource from "@/concurrency/PromiseCompletionSource";
import Connection from "@/websockets/Connection";
import Dependencies from "@/dependencies";
import packetLookup from "./packetLookup";

function ensureHasId(connection: Connection) {
  if (connection.playerId === undefined) {
    throw new Error("Action regarding connection connected to this world does not have a playerId assigned to it.");
  }
}

function ensureNotDead(shouldBeDead: boolean) {
  if (shouldBeDead) {
    throw new Error("Received join request despite the fact that this room should be dead.");
  }
}

// TODO: figure out actual used deps
type UsedDependencies = Pick<Dependencies, never>;

export default class RoomLogic {
  readonly deps: UsedDependencies;

  #onEmpty: PromiseCompletionSource<void>;
  #shouldBeDead: boolean = false;
  #players: Map<number, Connection>;
  #idCounter: number = 0;

  constructor(onEmpty: PromiseCompletionSource<void>, blocks: any, deps: UsedDependencies) {
    this.deps = deps;
    this.#onEmpty = onEmpty;
    this.#players = new Map();
  }

  handleJoin(connection: Connection): boolean {
    ensureNotDead(this.#shouldBeDead);

    // TODO: based off of room settings, allow this connection or not (debug only)
    // NOTE: code for the TODO above should primarily be in the code that generates tokens for connecting to worlds,
    // and before connecting the token should be checked if it should be invalidated.

    let id = this.#idCounter++;
    connection.playerId = id;
    this.#players.set(id, connection);
    return true;
  }

  handleLeave(connection: Connection) {
    ensureHasId(connection);
    ensureNotDead(this.#shouldBeDead);

    // TODO: broadcast leaving code

    this.#players.delete(connection.playerId!);

    if (this.#players.size === 0) {
      this.#shouldBeDead = true;
      this.#onEmpty.resolve();
    }
  }

  handleMessage(sender: Connection, packet: WorldPacket) {
    const handler = packetLookup[packet.packetId];

    //@ts-expect-error
    return handler(packet, this);
  }
}