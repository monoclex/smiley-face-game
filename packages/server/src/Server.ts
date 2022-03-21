import { ZPacket, ZSPacket } from "@smiley-face-game/api";
import Connection from "./Connection";
import Room from "./Room";
import packetLookup from "./packetLookup";
import { defaultOwnerPermissions, Permission } from "./Permissions";

export default class Server {
  readonly connections: Map<number, Connection> = new Map();
  readonly room: Room;

  constructor(readonly hostRoom: HostRoom, initialWorldData: HostWorldData) {
    this.room = new Room(hostRoom, initialWorldData);
  }

  onConnect(hostConnection: HostConnection) {
    const connection = new Connection(hostConnection);

    if (connection.isOwner) {
      connection.permissions.give(...defaultOwnerPermissions);
    }

    if (this.hostRoom.isDynamicRoom) {
      // TODO(config): allow users to set these permissions on join of a dynamic world
      connection.permissions.give(Permission.Edit);
    }

    // TODO: role if they're a friend or not

    // at this point, broadcasting will send it to everyone EXCEPT the one who's joining
    this.broadcast({
      packetId: "SERVER_PLAYER_JOIN",
      playerId: connection.id,
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
      worldId: this.hostRoom.id,
      playerId: connection.id,
      role: connection.role,
      spawnPosition: connection.lastPosition,
      size: { width: this.hostRoom.width, height: this.hostRoom.height },
      blocks: this.room.blocks.ids.state,
      heaps: this.room.blocks.heap.state,
      username: connection.username,
      isGuest: connection.isGuest,
      canGod: connection.canGod,
      players: Array.from(this.connections.values()).map((otherUser) => ({
        packetId: "SERVER_PLAYER_JOIN",
        playerId: otherUser.id,
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

    this.connections.set(connection.id, connection);
    connection.send(initPacket);
  }

  onDisconnect(connectionId: number) {
    const connection = this.connections.get(connectionId);
    if (!connection) throw new Error(`Unknown connection id ${connectionId}`);

    this.connections.delete(connection.id);

    this.broadcast({
      packetId: "SERVER_PLAYER_LEAVE",
      playerId: connection.id,
    });

    if (this.connections.size === 0) {
      host.signalKill();
    }
  }

  async onMessage(connectionId: number, message: string, sent: number) {
    const connection = this.connections.get(connectionId);
    if (!connection) throw new Error(`Unknown connection id ${connectionId}`);

    let packet: ZPacket;

    try {
      const payload = JSON.parse(message);
      packet = this.room.validator.parse(payload);
    } catch (err) {
      // TODO(logging): inform about packet that didn't validate
      return false;
    }

    const handler = packetLookup[packet.packetId];
    //@ts-expect-error typescript isn't smart enough to narrow `handler` properly.
    // to make up for this, `packetLookup` is very well typed
    const result = await handler(packet, [connection, this], sent);

    if (typeof result === "boolean") return result;
    return true;
  }

  broadcast(data: ZSPacket) {
    return host.broadcast(JSON.stringify(data));
  }

  broadcastExcept(exceptConnection: Connection, data: ZSPacket) {
    return host.broadcastExcept(JSON.stringify(data), exceptConnection.id);
  }

  saveWorld() {
    return host.saveWorld(this.room.serialize()).ToPromise();
  }

  async loadWorld() {
    const hostWorldData = await host.loadWorld().ToPromise();
    this.room.deserialize(hostWorldData);
  }

  // TODO(host-api): implement this
  changeTitle(title: string) {
    throw new Error("Method not implemented.");
  }
}
