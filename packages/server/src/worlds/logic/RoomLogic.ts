import { SERVER_PLAYER_JOIN_ID } from "@smiley-face-game/api/packets/ServerPlayerJoin";
import { SERVER_PLAYER_LEAVE_ID } from "@smiley-face-game/api/packets/ServerPlayerLeave";
import { SERVER_INIT_ID } from "@smiley-face-game/api/packets/ServerInit";
import { WorldPacket } from "@smiley-face-game/api/packets/WorldPacket";
import { WorldDetails } from "@smiley-face-game/api/schemas/WorldDetails";
import PromiseCompletionSource from "@/concurrency/PromiseCompletionSource";
import Connection from "@/worlds/Connection";
import { BlockHandler } from "@/worlds/blockhandling/BlockHandler";
import WorldBlocks from "@/worlds/WorldBlocks";
import packetLookup from "./packetLookup";
import WebSocket from "ws";

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

export default class RoomLogic {
  readonly blockHandler: BlockHandler;

  #onEmpty: PromiseCompletionSource<void>;
  #shouldBeDead: boolean = false;
  #players: Map<number, Connection>;
  #idCounter: number = 0;
  #details: WorldDetails;
  #setStoppingStatus: () => void;
  #id: string;

  get playerCount(): number { return this.#players.size; };

  constructor(onEmpty: PromiseCompletionSource<void>, blocks: WorldBlocks, details: WorldDetails, setStopping: () => void, id: string) {
    this.blockHandler = new BlockHandler(blocks, details.width, details.height);
    this.#onEmpty = onEmpty;
    this.#players = new Map();
    this.#details = details;
    this.#setStoppingStatus = setStopping;
    this.#id = id;
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
      worldId: this.#id,
      playerId: connection.playerId!,
      spawnPosition: connection.lastPosition,
      size: { width: this.#details.width, height: this.#details.height },
      blocks: this.blockHandler.map,
      username: connection.username,
      isGuest: connection.isGuest,
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
    
    this.#players.delete(connection.playerId!);

    if (this.#players.size === 0) {
      this.#shouldBeDead = true;
      this.#setStoppingStatus(); // TODO: figure out a better way to do this?
      // the above is being done to deal with like async stuff i think
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
      if (player.webSocket.readyState === WebSocket.OPEN) {
        player.webSocket.send(packetData);
      }
    }
  }

  broadcastExcept(excludePlayerId: number, packet: WorldPacket) {
    // TODO: use serialization stuff
    const packetData = JSON.stringify(packet);

    for (const player of this.#players.values()) {
      if (player.playerId === excludePlayerId) continue;
      if (player.webSocket.readyState === WebSocket.OPEN) {
        player.webSocket.send(packetData);
      }
    }
  }

  // TODO: handle block updates
}