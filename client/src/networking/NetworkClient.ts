import { TileId } from '../libcore/core/models/TileId';
import { TileLayer } from '../libcore/core/models/TileLayer';
import { BlockSinglePacket, BLOCK_SINGLE_ID } from '../libcore/core/networking/game/BlockSingle';
import { FireBulletPacket, FIRE_BULLET_ID } from '../libcore/core/networking/game/FireBullet';
import { MovementPacket, MOVEMENT_ID } from '../libcore/core/networking/game/Movement';
import { PickupGunPacket, PICKUP_GUN_ID } from '../libcore/core/networking/game/PickupGun';
import { SERVER_BLOCK_SINGLE_ID, validateServerBlockSingle } from '../libcore/core/networking/game/ServerBlockSingle';
import { SERVER_FIRE_BULLET_ID, validateServerFireBullet } from '../libcore/core/networking/game/ServerFireBullet';
import { SERVER_INIT_ID, validateServerInit } from '../libcore/core/networking/game/ServerInit';
import { SERVER_MOVEMENT_ID, validateServerMovement } from '../libcore/core/networking/game/ServerMovement';
import { SERVER_PICKUP_GUN_ID, validateServerPickupGun } from '../libcore/core/networking/game/ServerPickupGun';
import { SERVER_PLAYER_JOIN_ID, validateServerPlayerJoin } from '../libcore/core/networking/game/ServerPlayerJoin';
import { SERVER_PLAYER_LEAVE_ID, validateServerPlayerLeave } from '../libcore/core/networking/game/ServerPlayerLeave';
import { ControllerState } from '../scenes/world/components/KeyboardControlledPlayer';
import { NetworkEvents } from './NetworkEvents';

interface Position {
  readonly x: number;
  readonly y: number;
}

/**
 * Class to manage the network functionality of the client.
 */
export class NetworkClient {
  static async connect(target: string, registerCallbacks: (events: NetworkEvents) => void): Promise<NetworkClient> {
    return new Promise((resolve, reject) => {
      const webSocket = new WebSocket(target);
      const networkClient = new NetworkClient(webSocket);
      registerCallbacks(networkClient.events);

      webSocket.onopen = () => resolve(networkClient);

      webSocket.onerror = (error) => {
        console.warn('[websocket errror]', error);
        reject(error);
      };
    });
  }

  readonly events: NetworkEvents;
  private _pause: boolean;
  private _buffer: MessageEvent[];

  private constructor(
    private readonly _webSocket: WebSocket
  ) {
    this.events = new NetworkEvents();
    this._buffer = [];

    // TODO: type check this stuff
    const lookupTable = {
      [SERVER_BLOCK_SINGLE_ID]: [validateServerBlockSingle, 'onBlockSingle'],
      [SERVER_MOVEMENT_ID]: [validateServerMovement, 'onMovement'],
      [SERVER_PLAYER_JOIN_ID]: [validateServerPlayerJoin, 'onPlayerJoin'],
      [SERVER_PLAYER_LEAVE_ID]: [validateServerPlayerLeave, 'onPlayerLeave'],
      [SERVER_INIT_ID]: [validateServerInit, 'onInit'],
      [SERVER_PICKUP_GUN_ID]: [validateServerPickupGun, 'onPickupGun'],
      [SERVER_FIRE_BULLET_ID]: [validateServerFireBullet, 'onFireBullet'],
    };

    this._webSocket.onmessage = async (event) => {
      // if paused, push message to buffer and don't handle it
      if (this._pause) {
        this._buffer.push(event);
        return;
      }

      // packets come over the wire as a string of json
      const rawPacket = JSON.parse(event.data);

      if (!rawPacket.packetId || typeof rawPacket.packetId !== 'string') {
        console.warn('[websocket warn] server sent invalid packet', rawPacket);
        return;
      }

      // make sure we can validate the packet id thte server sent us
      if (!lookupTable[rawPacket.packetId]) {
        console.warn('[websocket] invalid packet id', rawPacket.packetId);
      }

      const [validate, callbackName] = lookupTable[rawPacket.packetId];

      // validate the packet (type checking stuffs)
      const [error, packet] = validate(rawPacket);

      if (error !== null) {
        console.warn('[websocket] packet invalidated', error, rawPacket);
      }

      // execute any hooks
      await this.events[callbackName](packet, this);
    };
  }

  /** Prevents any event handlers from being triggered. Pushes all incmoing messages into a buffer. */
  pause() {
    this._pause = true;
  }

  /** Unpauses the network client, and triggers all event handlers for any buffered actions. */
  async continue() {
    this._pause = false;

    for (const message of this._buffer) {
      await this._webSocket.onmessage(message);
    }

    this._buffer = [];
  }

  placeBlock(x: number, y: number, id: TileId, layer: TileLayer) {
    const packet: BlockSinglePacket = {
      packetId: BLOCK_SINGLE_ID,
      position: { x, y },
      layer, id,
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  move(position: Position, inputs: ControllerState) {
    const packet: MovementPacket = {
      packetId: MOVEMENT_ID,
      position,
      inputs,
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  gotGun(position: Position) {
    const packet: PickupGunPacket = {
      packetId: PICKUP_GUN_ID,
      position
    };

    this._webSocket.send(JSON.stringify(packet));
  }

  fireBullet(angle: number) {
    const packet: FireBulletPacket = {
      packetId: FIRE_BULLET_ID,
      angle
    };

    this._webSocket.send(JSON.stringify(packet));
  }
}
