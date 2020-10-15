import { Block } from "@smiley-face-game/schemas/Block";
import { ServerPackets } from "@smiley-face-game/packets/ServerPackets";
import { TileLayer } from "@smiley-face-game/schemas/TileLayer";
import TileState from "@smiley-face-game/common/tiles/TileState";
import { BlockLinePacket, BLOCK_LINE_ID } from "@smiley-face-game/packets/BlockLine";
import { BlockSinglePacket, BLOCK_SINGLE_ID } from "@smiley-face-game/packets/BlockSingle";
import { ChatPacket, CHAT_ID } from "@smiley-face-game/packets/Chat";
import { EquipGunPacket, EQUIP_GUN_ID } from "@smiley-face-game/packets/EquipGun";
import { FireBulletPacket, FIRE_BULLET_ID } from "@smiley-face-game/packets/FireBullet";
import { MovementPacket, MOVEMENT_ID } from "@smiley-face-game/packets/Movement";
import { PickupGunPacket, PICKUP_GUN_ID } from "@smiley-face-game/packets/PickupGun";
import {
  PlayerlistActionPacket,
  PLAYER_LIST_ACTION_ID,
} from "@smiley-face-game/packets/PlayerlistAction";
import {
  ServerBlockBufferValidator,
  SERVER_BLOCK_BUFFER_ID,
} from "@smiley-face-game/packets/ServerBlockBuffer";
import {
  SERVER_BLOCK_LINE_ID,
  validateServerBlockLine,
} from "@smiley-face-game/packets/ServerBlockLine";
import {
  ServerBlockSingleValidator,
  SERVER_BLOCK_SINGLE_ID,
} from "@smiley-face-game/packets/ServerBlockSingle";
import { SERVER_CHAT_ID, validateServerChat } from "@smiley-face-game/packets/ServerChat";
import {
  SERVER_EQUIP_GUN_ID,
  validateServerEquipGun,
} from "@smiley-face-game/packets/ServerEquipGun";
import {
  SERVER_FIRE_BULLET_ID,
  validateServerFireBullet,
} from "@smiley-face-game/packets/ServerFireBullet";
import { SERVER_INIT_ID, validateServerInit } from "@smiley-face-game/packets/ServerInit";
import {
  SERVER_MOVEMENT_ID,
  validateServerMovement,
} from "@smiley-face-game/packets/ServerMovement";
import { isServerPacket } from "@smiley-face-game/packets/ServerPackets";
import {
  SERVER_PICKUP_GUN_ID,
  validateServerPickupGun,
} from "@smiley-face-game/packets/ServerPickupGun";
import {
  SERVER_PLAYER_JOIN_ID,
  validateServerPlayerJoin,
} from "@smiley-face-game/packets/ServerPlayerJoin";
import {
  SERVER_PLAYER_LEAVE_ID,
  validateServerPlayerLeave,
} from "@smiley-face-game/packets/ServerPlayerLeave";
import {
  SERVER_ROLE_UPDATE_ID,
  validateServerRoleUpdate,
} from "@smiley-face-game/packets/ServerRoleUpdate";
import { WorldPacket } from "@smiley-face-game/packets/WorldPacket";

import type WebSocket from "ws";
import type { MessageEvent } from "ws";

class NetworkEvents {
  constructor(
    readonly validateServerBlockSingle: ServerBlockSingleValidator,
    readonly validateServerBlockBuffer: ServerBlockBufferValidator
  ) { }

  callback!: (packet: ServerPackets) => void | Promise<void>;

  triggerEvent(rawPacket: any): void | Promise<void> {
    // make sure we can validate the packet id thte server sent us
    if (!isServerPacket(rawPacket)) {
      console.error("[websocket] invalid packet id", rawPacket.packetId);
      return;
    }

    const lookup = {
      [SERVER_BLOCK_SINGLE_ID]: this.validateServerBlockSingle,
      [SERVER_MOVEMENT_ID]: validateServerMovement,
      [SERVER_PLAYER_JOIN_ID]: validateServerPlayerJoin,
      [SERVER_PLAYER_LEAVE_ID]: validateServerPlayerLeave,
      [SERVER_INIT_ID]: validateServerInit,
      [SERVER_PICKUP_GUN_ID]: validateServerPickupGun,
      [SERVER_FIRE_BULLET_ID]: validateServerFireBullet,
      [SERVER_EQUIP_GUN_ID]: validateServerEquipGun,
      [SERVER_BLOCK_LINE_ID]: validateServerBlockLine,
      [SERVER_BLOCK_BUFFER_ID]: this.validateServerBlockBuffer,
      [SERVER_CHAT_ID]: validateServerChat,
      [SERVER_ROLE_UPDATE_ID]: validateServerRoleUpdate,
    };

    // validate the packet (type checking stuffs)
    //@ts-ignore
    const [error, packet] = lookup[rawPacket.packetId](rawPacket);

    if (error !== null || packet === undefined) {
      console.error("[websocket] packet invalidated", error, rawPacket);
      return;
    }

    return this.callback(packet);
  }
}

interface Position {
  readonly x: number;
  readonly y: number;
}

/**
 * Class to manage the network functionality of the client.
 */
export class NetworkClient {
  static connect(
    targetWebSocketUrl: string,
    registerCallbacks: (client: NetworkClient) => void,
    validateServerBlockBuffer: ServerBlockBufferValidator,
    validateServerBlockSingle: ServerBlockSingleValidator,
    webSocketImpl: new (address: string) => WebSocket
  ): Promise<NetworkClient> {
    return new Promise((resolve, reject) => {
      let resolved = false;
      const webSocket = new webSocketImpl(targetWebSocketUrl);
      const networkClient = new NetworkClient(
        webSocket,
        validateServerBlockBuffer,
        validateServerBlockSingle
      );
      registerCallbacks(networkClient);

      webSocket.addEventListener("message", (message) => {
        let parsed = JSON.parse(message.data);
        if (parsed.error) {
          reject(new Error(parsed.error));
        } else {
          if (!resolved) {
            resolve(networkClient);
          }
          resolved = true;
        }
      });

      webSocket.addEventListener("error", (error) => {
        console.warn("[websocket errror]", error);
        reject(error);
      });

      webSocket.addEventListener("close", () => {
        console.warn("websocket connection closed");
        if (!resolved) {
          resolved = false;
          reject("modernity");
        }
      });
    });
  }

  readonly events: NetworkEvents;
  private _pause: boolean = false;
  private _buffer: MessageEvent[];
  private _showClosingAlert: boolean = false;

  private constructor(
    private readonly _webSocket: WebSocket,
    validateServerBlockBuffer: ServerBlockBufferValidator,
    validateServerBlockSingle: ServerBlockSingleValidator
  ) {
    this.events = new NetworkEvents(
      validateServerBlockSingle,
      validateServerBlockBuffer
    );
    this._buffer = [];

    const onClose = (event: { reason: string } | { error: Error }) => {
      if (this._showClosingAlert) {
        const reason = "reason" in event ? event.reason : event.error.message;
        //@ts-ignore
        alert(
          "connection to server died, pls refresh" +
          (reason || JSON.stringify(event))
        );
      }
    };
    this._webSocket.addEventListener("close", onClose);
    this._webSocket.addEventListener("error", onClose);

    this._webSocket.addEventListener("message", this.handleMessage.bind(this));
  }

  async handleMessage(event: MessageEvent) {
    // if paused, push message to buffer and don't handle it
    if (this._pause) {
      this._buffer.push(event);
      return;
    }

    if (typeof event.data !== "string") {
      console.warn("expected string for packet");
      return;
    }

    // packets come over the wire as a string of json
    const rawPacket = JSON.parse(event.data);

    if (!rawPacket.packetId || typeof rawPacket.packetId !== "string") {
      console.error("[websocket warn] server sent invalid packet", rawPacket);
      return;
    }

    this._showClosingAlert = true; // if we get this far in handling a message, we're definitely in game and not receiving an error packet
    await this.events.triggerEvent(rawPacket);
  }

  destroy(): void {
    this._showClosingAlert = false;
    this._webSocket.close();
  }

  /** Prevents any event handlers from being triggered. Pushes all incmoing messages into a buffer. */
  pause(): void {
    this._pause = true;

    // add a warning incase the websocket isn't unpaused
    // for development purposes onyl pretty much
    let warn: () => void;
    warn = (() => {
      if (this._pause) {
        console.warn("NetworkClient websocket hasn't been unpaused yet.");
        setTimeout(warn, 1000);
      }
    }).bind(this);
    setTimeout(warn, 1000);
  }

  /** Unpauses the network client, and triggers all event handlers for any buffered actions. */
  async continue(): Promise<void> {
    this._pause = false;

    for (const message of this._buffer) {
      await this.handleMessage(message);
    }

    this._buffer = [];
  }

  placeBlock(x: number, y: number, id: Block, layer: TileLayer): void {
    //@ts-ignore
    const packet: BlockSinglePacket = {
      packetId: BLOCK_SINGLE_ID,
      position: { x, y },
      layer,
      block: id,
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  //@ts-ignore
  move(position: Position, velocity: Position, inputs: MovementValues): void {
    const packet: MovementPacket = {
      packetId: MOVEMENT_ID,
      position: { x: position.x, y: position.y }, // we don't deconstruct to prevent sending needless data on the wire
      inputs: {
        left: inputs.left,
        right: inputs.right,
        up: inputs.up,
        jump: inputs.jump,
      },
      velocity: { x: velocity.x, y: velocity.y },
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  gotGun(position: Position): void {
    const packet: PickupGunPacket = {
      packetId: PICKUP_GUN_ID,
      position,
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  fireBullet(angle: number): void {
    const packet: FireBulletPacket = {
      packetId: FIRE_BULLET_ID,
      angle,
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  equipGun(equipped: boolean): void {
    const packet: EquipGunPacket = {
      packetId: EQUIP_GUN_ID,
      equipped,
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  placeLine(
    tileLayer: TileLayer,
    start: Position,
    end: Position,
    _activeBlock: TileState
  ): void {
    //@ts-ignore
    const packet: BlockLinePacket = {
      packetId: BLOCK_LINE_ID,
      layer: tileLayer,
      start,
      end,
      block: _activeBlock,
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  chat(message: string) {
    const packet: ChatPacket = {
      packetId: CHAT_ID,
      message,
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  giveEdit(playerId: number) {
    const packet: PlayerlistActionPacket = {
      packetId: PLAYER_LIST_ACTION_ID,
      action: "give edit",
      playerId,
    };

    this.send(packet);
  }

  takeEdit(playerId: number) {
    const packet: PlayerlistActionPacket = {
      packetId: PLAYER_LIST_ACTION_ID,
      action: "remove edit",
      playerId,
    };

    this.send(packet);
  }

  kick(playerId: number) {
    const packet: PlayerlistActionPacket = {
      packetId: PLAYER_LIST_ACTION_ID,
      action: "kick",
      playerId,
    };

    this.send(packet);
  }

  send(packet: WorldPacket) {
    this._webSocket.send(JSON.stringify(packet));
  }
}
