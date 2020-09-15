import { TileId } from '@smiley-face-game/api/schemas/TileId';
import { TileLayer } from '@smiley-face-game/api/schemas/TileLayer';
import { BlockLinePacket, BLOCK_LINE_ID } from './packets/BlockLine';
import { BlockSinglePacket, BLOCK_SINGLE_ID } from './packets/BlockSingle';
import { EquipGunPacket, EQUIP_GUN_ID } from './packets/EquipGun';
import { FireBulletPacket, FIRE_BULLET_ID } from './packets/FireBullet';
import { MovementPacket, MOVEMENT_ID } from './packets/Movement';
import { PickupGunPacket, PICKUP_GUN_ID } from './packets/PickupGun';
import { SERVER_BLOCK_BUFFER_ID, ServerBlockBufferValidator } from './packets/ServerBlockBuffer';
import { SERVER_BLOCK_LINE_ID, validateServerBlockLine } from './packets/ServerBlockLine';
import { SERVER_BLOCK_SINGLE_ID, ServerBlockSingleValidator } from './packets/ServerBlockSingle';
import { SERVER_EQUIP_GUN_ID, validateServerEquipGun } from './packets/ServerEquipGun';
import { SERVER_FIRE_BULLET_ID, validateServerFireBullet } from './packets/ServerFireBullet';
import { SERVER_INIT_ID, validateServerInit } from './packets/ServerInit';
import { SERVER_MOVEMENT_ID, validateServerMovement } from './packets/ServerMovement';
import { SERVER_PICKUP_GUN_ID, validateServerPickupGun } from './packets/ServerPickupGun';
import { SERVER_PLAYER_JOIN_ID, validateServerPlayerJoin } from './packets/ServerPlayerJoin';
import { SERVER_PLAYER_LEAVE_ID, validateServerPlayerLeave } from './packets/ServerPlayerLeave';
import { WorldPacket } from "./packets/WorldPacket";
import { ServerPackets } from "@smiley-face-game/api/packets/ServerPackets";
import { isServerPacket } from "./packets/ServerPackets";

class NetworkEvents {
  constructor(
    readonly validateServerBlockSingle: ServerBlockSingleValidator,
    readonly validateServerBlockBuffer: ServerBlockBufferValidator,
  ) {}

  callback: (packet: ServerPackets) => void | Promise<void>;

  triggerEvent(rawPacket: any): void | Promise<void> {
    // make sure we can validate the packet id thte server sent us
    if (!isServerPacket(rawPacket)) {
      console.error('[websocket] invalid packet id', rawPacket.packetId);
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
    };
    
    // validate the packet (type checking stuffs)
    //@ts-ignore
    const [error, packet] = lookup[rawPacket.packetId](rawPacket);

    if (error !== null) {
      console.error('[websocket] packet invalidated', error, rawPacket);
      return;
    }

    return this.callback(packet);
  }
}

interface Position {
  readonly x: number;
  readonly y: number;
}

interface InputState {
  readonly left: boolean;
  readonly right: boolean;
  readonly jump: boolean;
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
  ): Promise<NetworkClient> {
    return new Promise((resolve, reject) => {
      let resolved = false;
      const webSocket = new WebSocket(targetWebSocketUrl);
      const networkClient = new NetworkClient(webSocket, validateServerBlockBuffer, validateServerBlockSingle);
      registerCallbacks(networkClient);

      webSocket.addEventListener("message", () => {
        if (!resolved) {
          resolve(networkClient);
        }
        resolved = true;
      });

      webSocket.addEventListener("error", (error) => {
        console.warn('[websocket errror]', error);
        reject(error);
      });

      webSocket.addEventListener("close", () => {
        console.warn("websocket connection closed");
        if (!resolved) {
          resolved = false
          reject("modernity");
        }
      });
    });
  }

  readonly events: NetworkEvents;
  private _pause: boolean = false;
  private _buffer: MessageEvent[];
  private _showClosingAlert: boolean = true;

  private constructor(
    private readonly _webSocket: WebSocket,
    validateServerBlockBuffer: ServerBlockBufferValidator,
    validateServerBlockSingle: ServerBlockSingleValidator,
  ) {
    this.events = new NetworkEvents(validateServerBlockSingle, validateServerBlockBuffer);
    this._buffer = [];

    const onClose = (event) => {
      if (this._showClosingAlert) {
        //@ts-ignore
        alert('connection to server died, pls refresh' + (event.reason || JSON.stringify(event)));
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

    // packets come over the wire as a string of json
    const rawPacket = JSON.parse(event.data);

    console.log(rawPacket.packetId);

    if (!rawPacket.packetId || typeof rawPacket.packetId !== 'string') {
      console.error('[websocket warn] server sent invalid packet', rawPacket);
      return;
    }

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
    let warn;
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

  placeBlock(x: number, y: number, id: TileId, layer: TileLayer): void {
    const packet: BlockSinglePacket = {
      packetId: BLOCK_SINGLE_ID,
      position: { x, y },
      layer, id,
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  move(position: Position, velocity: Position, inputs: InputState): void {
    const packet: MovementPacket = {
      packetId: MOVEMENT_ID,
      position: { x: position.x, y: position.y }, // we don't deconstruct to prevent sending needless data on the wire
      inputs: { left: inputs.left, right: inputs.right, up: inputs.jump },
      velocity: { x: velocity.x, y: velocity.y },
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  gotGun(position: Position): void {
    const packet: PickupGunPacket = {
      packetId: PICKUP_GUN_ID,
      position
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  fireBullet(angle: number): void {
    const packet: FireBulletPacket = {
      packetId: FIRE_BULLET_ID,
      angle
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  equipGun(equipped: boolean): void {
    const packet: EquipGunPacket = {
      packetId: EQUIP_GUN_ID,
      equipped
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  placeLine(tileLayer: TileLayer, start: Position, end: Position, _activeBlock: TileId): void {
    const packet: BlockLinePacket = {
      packetId: BLOCK_LINE_ID,
      layer: tileLayer,
      start,
      end,
      id: _activeBlock,
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  send(packet: WorldPacket) {
    this._webSocket.send(JSON.stringify(packet));
  }
}
