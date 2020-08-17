import { TileId } from '@smiley-face-game/api/schemas/TileId';
import { TileLayer } from '@smiley-face-game/api/schemas/TileLayer';
import { BlockLinePacket, BLOCK_LINE_ID } from './packets/BlockLine';
import { BlockSinglePacket, BLOCK_SINGLE_ID } from './packets/BlockSingle';
import { EquipGunPacket, EQUIP_GUN_ID } from './packets/EquipGun';
import { FireBulletPacket, FIRE_BULLET_ID } from './packets/FireBullet';
import { MovementPacket, MOVEMENT_ID } from './packets/Movement';
import { PickupGunPacket, PICKUP_GUN_ID } from './packets/PickupGun';
import { ServerBlockBufferPacket, SERVER_BLOCK_BUFFER_ID, ServerBlockBufferValidator } from './packets/ServerBlockBuffer';
import { ServerBlockLinePacket, SERVER_BLOCK_LINE_ID, validateServerBlockLine } from './packets/ServerBlockLine';
import { ServerBlockSinglePacket, SERVER_BLOCK_SINGLE_ID, ServerBlockSingleValidator } from './packets/ServerBlockSingle';
import { ServerEquipGunPacket, SERVER_EQUIP_GUN_ID, validateServerEquipGun } from './packets/ServerEquipGun';
import { ServerFireBulletPacket, SERVER_FIRE_BULLET_ID, validateServerFireBullet } from './packets/ServerFireBullet';
import { ServerInitPacket, SERVER_INIT_ID, validateServerInit } from './packets/ServerInit';
import { ServerMovementPacket, SERVER_MOVEMENT_ID, validateServerMovement } from './packets/ServerMovement';
import { ServerPickupGunPacket, SERVER_PICKUP_GUN_ID, validateServerPickupGun } from './packets/ServerPickupGun';
import { ServerPlayerJoinPacket, SERVER_PLAYER_JOIN_ID, validateServerPlayerJoin } from './packets/ServerPlayerJoin';
import { ServerPlayerLeavePacket, SERVER_PLAYER_LEAVE_ID, validateServerPlayerLeave } from './packets/ServerPlayerLeave';

export type NetworkEventHandler<TEvent> = (event: TEvent, sender: NetworkClient) => void | Promise<void>;

export class NetworkEvents {
  onBlockSingle?: NetworkEventHandler<ServerBlockSinglePacket>;
  onMovement?: NetworkEventHandler<ServerMovementPacket>;
  onPlayerJoin?: NetworkEventHandler<ServerPlayerJoinPacket>;
  onPlayerLeave?: NetworkEventHandler<ServerPlayerLeavePacket>;
  onInit?: NetworkEventHandler<ServerInitPacket>;
  onPickupGun?: NetworkEventHandler<ServerPickupGunPacket>;
  onFireBullet?: NetworkEventHandler<ServerFireBulletPacket>;
  onEquipGun?: NetworkEventHandler<ServerEquipGunPacket>;
  onBlockLine?: NetworkEventHandler<ServerBlockLinePacket>;
  onBlockBuffer?: NetworkEventHandler<ServerBlockBufferPacket>;
}

interface Position {
  readonly x: number;
  readonly y: number;
}

interface InputState {
  readonly left: boolean;
  readonly right: boolean;
  readonly up: boolean;
}

/**
 * Class to manage the network functionality of the client.
 */
export class NetworkClient {
  static connect(
    targetWebSocketUrl: string,
    registerCallbacks: (events: NetworkEvents) => void,
    validateServerBlockBuffer: ServerBlockBufferValidator,
    validateServerBlockSingle: ServerBlockSingleValidator,
  ): Promise<NetworkClient> {
    return new Promise((resolve, reject) => {
      const webSocket = new WebSocket(targetWebSocketUrl);
      const networkClient = new NetworkClient(webSocket, validateServerBlockBuffer, validateServerBlockSingle);
      registerCallbacks(networkClient.events);

      webSocket.onopen = () => resolve(networkClient);

      webSocket.onerror = (error) => {
        console.warn('[websocket errror]', error);
        reject(error);
      };
    });
  }

  readonly events: NetworkEvents;
  private _pause!: boolean;
  private _buffer: MessageEvent[];

  private constructor(
    private readonly _webSocket: WebSocket,
    validateServerBlockBuffer: ServerBlockBufferValidator,
    validateServerBlockSingle: ServerBlockSingleValidator,
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

    this._webSocket.onclose = this._webSocket.onerror = (event) => {
      console.log(event);
      //@ts-ignore
      alert('connection to server died, pls refresh' + (event.reason || JSON.stringify(event)));
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
        console.error('[websocket warn] server sent invalid packet', rawPacket);
        return;
      }

      // make sure we can validate the packet id thte server sent us
      if (!lookupTable[rawPacket.packetId]) {
        console.error('[websocket] invalid packet id', rawPacket.packetId);
        return;
      }

      const [validate, callbackName] = lookupTable[rawPacket.packetId];

      // validate the packet (type checking stuffs)
      const [error, packet] = validate(rawPacket);

      if (error !== null) {
        console.error('[websocket] packet invalidated', error, rawPacket);
        return;
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
      position: { x: position.x, y: position.y },
      inputs: { left: inputs.left, right: inputs.right, up: inputs.up },
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
