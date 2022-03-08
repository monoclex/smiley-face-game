import Connection from "../../worlds/Connection";
import { BlockHandler } from "../../worlds/blockhandling/BlockHandler";
import packetLookup from "./packetLookup";
import type { ZPacket, ZSPacket } from "@smiley-face-game/api";
import { useDev } from "@smiley-face-game/api";
import type { ZHeap, ZHeaps, ZWorldBlocks, ZWorldDetails } from "@smiley-face-game/api/types";
import TileJson from "../TileJson";
import loadWorldData from "../loadWorldData";
import { WorldLayer } from "@smiley-face-game/api/game/WorldLayer";
import { saveWorldVersion2 } from "@smiley-face-game/api/tiles/format/WorldDataVersion2";
import { FormatLoader } from "@smiley-face-game/api/tiles/format/FormatLoader";

useDev();
function ensureHasId(connection: Connection) {
  if (connection.playerId === undefined) {
    throw new Error(
      "Action regarding connection connected to this world does not have a playerId assigned to it."
    );
  }
}

function ensureNotDead(shouldBeDead: boolean) {
  if (shouldBeDead) {
    throw new Error("Received join request despite the fact that this room should be dead.");
  }
}

export default class RoomLogic {
  readonly blockHandler: BlockHandler;

  #shouldBeDead = false;
  #players: Map<number, Connection>;
  #idCounter = 0;
  #details: ZWorldDetails;
  #id: string;

  get playerCount(): number {
    return this.#players.size;
  }
  player(id: number): Connection | undefined {
    return this.#players.get(id);
  }

  constructor(
    blocks: ZWorldBlocks,
    heaps: ZHeaps,
    details: ZWorldDetails,
    id: string,
    readonly hostRoom: HostRoom
  ) {
    this.blockHandler = new BlockHandler(TileJson, blocks, heaps, details.width, details.height);
    this.#players = new Map();
    this.#details = details;
    this.#id = id;
  }

  handleJoin(connection: Connection): boolean {
    ensureNotDead(this.#shouldBeDead);

    // TODO: based off of room settings, allow this connection or not (debug only)
    // NOTE: code for the TODO above should primarily be in the code that generates tokens for connecting to worlds,
    // and before connecting the token should be checked if it should be invalidated.

    const isOwner = connection.connection.userId === this.#details.ownerId;

    const id = this.#idCounter++;
    connection.playerId = id;

    if (this.hostRoom.isSavedRoom) {
      connection.hasEdit = isOwner;
      connection.canGod = isOwner;
      connection.isOwner = isOwner;
    } else {
      connection.hasEdit = true;
      connection.canGod = false; // TODO(create-world-dialogue): allow configurability
    }

    if (isOwner) {
      connection.role = "owner";
    } else if (connection.hasEdit) {
      connection.role = "edit";
    }

    // TODO: role if they're a friend or not

    // at this point, broadcasting will send it to everyone EXCEPT the one who's joining
    this.broadcast({
      packetId: "SERVER_PLAYER_JOIN",
      playerId: connection.playerId,
      username: connection.username,
      role: connection.role,
      isGuest: connection.isGuest,
      joinLocation: connection.lastPosition,
      hasGun: connection.hasGun,
      gunEquipped: connection.gunEquipped,
      canGod: connection.canGod,
      inGod: connection.inGod,
    });

    const initPacket: ZSPacket = {
      packetId: "SERVER_INIT",
      worldId: this.#id,
      playerId: connection.playerId,
      role: connection.role,
      spawnPosition: connection.lastPosition,
      size: { width: this.#details.width, height: this.#details.height },
      blocks: this.blockHandler.ids.state,
      heaps: this.blockHandler.heap.state,
      username: connection.username,
      isGuest: connection.isGuest,
      canGod: connection.canGod,
      players: Array.from(this.#players.values()).map((otherUser) => ({
        packetId: "SERVER_PLAYER_JOIN",
        playerId: otherUser.playerId,
        username: otherUser.username,
        role: otherUser.role,
        isGuest: otherUser.isGuest,
        joinLocation: otherUser.lastPosition,
        hasGun: otherUser.hasGun,
        gunEquipped: otherUser.gunEquipped,
        canGod: otherUser.canGod,
        inGod: otherUser.inGod,
      })),
    };

    connection.send(initPacket);

    this.#players.set(id, connection);
    return true;
  }

  handleLeave(connection: Connection) {
    ensureHasId(connection);
    ensureNotDead(this.#shouldBeDead);

    this.#players.delete(connection.playerId);

    if (this.#players.size === 0) {
      this.#shouldBeDead = true;
      host.signalKill();
      return;
    }

    this.broadcast({
      packetId: "SERVER_PLAYER_LEAVE",
      playerId: connection.playerId,
    });
  }

  handleMessage(sender: Connection, packet: ZPacket) {
    const handler = packetLookup[packet.packetId];
    //@ts-expect-error typescript isn't smart enough to narrow `handler` properly.
    // to make up for this, `packetLookup` is very well typed
    return handler(packet, [sender, this]);
  }

  broadcast(packet: ZSPacket) {
    const packetData = JSON.stringify(packet);

    for (const player of this.#players.values()) {
      player.connection.send(packetData);
    }
  }

  broadcastExcept(excludePlayerId: number, packet: ZSPacket) {
    const packetData = JSON.stringify(packet);

    for (const player of this.#players.values()) {
      if (player.playerId === excludePlayerId) continue;
      player.connection.send(packetData);
    }
  }

  async loadBlocks(): Promise<[WorldLayer<number>, WorldLayer<ZHeap | 0>]> {
    // short-circuiting optimization: this should never actually happen tho
    if (!this.hostRoom.isSavedRoom) throw new Error("Cannot load dynamic world!");

    const worldSize = { x: this.hostRoom.width, y: this.hostRoom.height };
    const worldData = await this.hostRoom.load();

    const formatLoader = loadWorldData(worldSize, worldData);

    return [formatLoader.world, formatLoader.heap];
  }

  async saveBlocks(blocks: ZWorldBlocks, heaps: ZHeaps): Promise<void> {
    // short-circuiting optimization: this should never actually happen tho
    if (!this.hostRoom.isSavedRoom) throw new Error("Cannot save saved world!");

    const worldSize = { x: this.hostRoom.width, y: this.hostRoom.height };
    const formatLoader = new FormatLoader(TileJson, worldSize);

    formatLoader.world.state = blocks;
    formatLoader.heap.state = heaps;

    const serialized = saveWorldVersion2(formatLoader);
    await this.hostRoom.save({ worldDataVersion: 2, worldData: JSON.stringify(serialized) });
  }
}
