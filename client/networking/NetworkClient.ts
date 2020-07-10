import { TileId } from '../../common/models/TileId';
import { TileLayer } from '../../common/models/TileLayer';
import { BlockLinePacket, BLOCK_LINE_ID } from '../../common/networking/game/BlockLine';
import { BlockSinglePacket, BLOCK_SINGLE_ID } from '../../common/networking/game/BlockSingle';
import { EquipGunPacket, EQUIP_GUN_ID } from '../../common/networking/game/EquipGun';
import { FireBulletPacket, FIRE_BULLET_ID } from '../../common/networking/game/FireBullet';
import { MovementPacket, MOVEMENT_ID } from '../../common/networking/game/Movement';
import { PickupGunPacket, PICKUP_GUN_ID } from '../../common/networking/game/PickupGun';
import { SERVER_BLOCK_BUFFER_ID, validateServerBlockBuffer } from '../../common/networking/game/ServerBlockBuffer';
import { SERVER_BLOCK_LINE_ID, validateServerBlockLine } from '../../common/networking/game/ServerBlockLine';
import { SERVER_BLOCK_SINGLE_ID, validateServerBlockSingle } from '../../common/networking/game/ServerBlockSingle';
import { SERVER_EQUIP_GUN_ID, validateServerEquipGun } from '../../common/networking/game/ServerEquipGun';
import { SERVER_FIRE_BULLET_ID, validateServerFireBullet } from '../../common/networking/game/ServerFireBullet';
import { SERVER_INIT_ID, validateServerInit } from '../../common/networking/game/ServerInit';
import { SERVER_MOVEMENT_ID, validateServerMovement } from '../../common/networking/game/ServerMovement';
import { SERVER_PICKUP_GUN_ID, validateServerPickupGun } from '../../common/networking/game/ServerPickupGun';
import { SERVER_PLAYER_JOIN_ID, validateServerPlayerJoin } from '../../common/networking/game/ServerPlayerJoin';
import { SERVER_PLAYER_LEAVE_ID, validateServerPlayerLeave } from '../../common/networking/game/ServerPlayerLeave';
import { InputState } from '../scenes/world/components/InputState';
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
      [SERVER_EQUIP_GUN_ID]: [validateServerEquipGun, 'onEquipGun'],
      [SERVER_BLOCK_LINE_ID]: [validateServerBlockLine, 'onBlockLine'],
      [SERVER_BLOCK_BUFFER_ID]: [validateServerBlockBuffer, 'onBlockBuffer'],
    };

    this._webSocket.onclose = this._webSocket.onerror = () => {
      alert('connection to server died, pls refresh');
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

      const eventCallback = this.events[callbackName];

      if (eventCallback === undefined) {
        console.warn('unregistered callback', callbackName);
        return;
      }

      // execute any hooks
      await eventCallback(packet, this);
    };
  }

  /** Prevents any event handlers from being triggered. Pushes all incmoing messages into a buffer. */
  pause(): void {
    this._pause = true;
  }

  /** Unpauses the network client, and triggers all event handlers for any buffered actions. */
  async continue(): Promise<void> {
    this._pause = false;

    for (const message of this._buffer) {
      await this._webSocket.onmessage(message);
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

  move(position: Position, inputs: InputState): void {
    const packet: MovementPacket = {
      packetId: MOVEMENT_ID,
      position,
      inputs,
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
}
