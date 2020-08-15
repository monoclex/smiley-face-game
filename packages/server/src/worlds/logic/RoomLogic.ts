import { SERVER_PLAYER_JOIN_ID } from "@smiley-face-game/api/packets/ServerPlayerJoin";
import { SERVER_PLAYER_LEAVE_ID } from "@smiley-face-game/api/src/packets/ServerPlayerLeave";
import { SERVER_INIT_ID } from "@smiley-face-game/api/packets/ServerInit";
import { WorldPacket } from "@smiley-face-game/api/packets/WorldPacket";
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
    
    // at this point, broadcasting will send it to everyone EXCEPT the one who's joining
    this.broadcast({
      packetId: SERVER_PLAYER_JOIN_ID,
      playerId: connection.playerId!,
      username: connection.username,
      isGuest: connection.isGuest,
      joinLocation: connection.lastPosition,
      hasGun: connection.hasGun,
      gunEquipped: connection.gunEquipped,
    });

    connection.send({
      packetId: SERVER_INIT_ID,
      playerId: connection.playerId!,
      spawnPosition: connection.lastPosition,
      size: { width: 0, height: 0 },
      blocks: [],
    });

    for (const otherUser of this.#players.values()) {
      connection.send({
        packetId: SERVER_PLAYER_JOIN_ID,
        playerId: otherUser.playerId!,
        username: otherUser.username,
        isGuest: otherUser.isGuest,
        joinLocation: otherUser.lastPosition,
        hasGun: otherUser.hasGun,
        gunEquipped: otherUser.gunEquipped
      });
    }

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
      return;
    }

    this.broadcast({
      packetId: SERVER_PLAYER_LEAVE_ID,
      playerId: connection.playerId!
    });
  }

  handleMessage(sender: Connection, packet: WorldPacket) {
    const handler = packetLookup[packet.packetId];

    //@ts-expect-error
    return handler(packet, [sender, this]);
  }

  broadcast(packet: WorldPacket) {
    // TODO: use serialization stuff
    const packetData = JSON.stringify(packet);

    for (const player of this.#players.values()) {
      player.webSocket.send(packetData);
    }
  }

  // TODO: handle block updates
}