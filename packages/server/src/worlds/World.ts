import { BlockBufferPacket, BLOCK_BUFFER_ID } from '@smiley-face-game/api/networking/packets/BlockBuffer';
import { BlockLinePacket, BLOCK_LINE_ID } from '@smiley-face-game/api/networking/packets/BlockLine';
import { BlockSinglePacket, BLOCK_SINGLE_ID } from "@smiley-face-game/api/networking/packets/BlockSingle";
import { EquipGunPacket, EQUIP_GUN_ID } from '@smiley-face-game/api/networking/packets/EquipGun';
import { FireBulletPacket, FIRE_BULLET_ID } from '@smiley-face-game/api/networking/packets/FireBullet';
import { MovementPacket, MOVEMENT_ID } from "@smiley-face-game/api/networking/packets/Movement";
import { PickupGunPacket, PICKUP_GUN_ID } from '@smiley-face-game/api/networking/packets/PickupGun';
import { SERVER_BLOCK_BUFFER_ID } from '@smiley-face-game/api/networking/packets/ServerBlockBuffer';
import { SERVER_BLOCK_LINE_ID } from '@smiley-face-game/api/networking/packets/ServerBlockLine';
import { SERVER_BLOCK_SINGLE_ID } from "@smiley-face-game/api/networking/packets/ServerBlockSingle";
import { ServerEquipGunPacket, SERVER_EQUIP_GUN_ID } from '@smiley-face-game/api/networking/packets/ServerEquipGun';
import { ServerFireBulletPacket, SERVER_FIRE_BULLET_ID } from '@smiley-face-game/api/networking/packets/ServerFireBullet';
import { SERVER_INIT_ID } from "@smiley-face-game/api/networking/packets/ServerInit";
import { ServerMovementPacket, SERVER_MOVEMENT_ID } from "@smiley-face-game/api/networking/packets/ServerMovement";
import { ServerPickupGunPacket, SERVER_PICKUP_GUN_ID } from '@smiley-face-game/api/networking/packets/ServerPickupGun';
import { SERVER_PLAYER_JOIN_ID } from "@smiley-face-game/api/networking/packets/ServerPlayerJoin";
import { SERVER_PLAYER_LEAVE_ID } from "@smiley-face-game/api/networking/packets/ServerPlayerLeave";
import { invokeWorldPacketLookup, WorldPacket, WorldPacketLookup } from "@smiley-face-game/api/networking/packets/WorldPacket";
import { TileId } from '@smiley-face-game/api/schemas/TileId';
import { TileLayer } from '@smiley-face-game/api/schemas/TileLayer';
import { UserId } from "@smiley-face-game/api/schemas/UserId";
import { World as DbWorld } from "../models/World";
import { AllowJoin } from "./AllowJoin";
import { BlockHandler } from './blockhandling/BlockHandler';
import { WorldUser } from "./User";
import { ValidMessage } from "./ValidMessage";

export class World {
  private readonly _lookup: WorldPacketLookup<WorldUser, Promise<ValidMessage>>;
  readonly users: Map<UserId, WorldUser>;
  readonly _map: BlockHandler;

  newId = 0;

  constructor(
    dbWorld: DbWorld | undefined,
    private readonly _width: number,
    private readonly _height: number,
    readonly destroy: () => void,
  ) {
    if (dbWorld) {
      // TODO: assign width and height
    }

    //@ts-ignore
    this._lookup = {
      //@ts-ignore
      [BLOCK_SINGLE_ID]: this.onBlockSingle.bind(this),
      //@ts-ignore
      [MOVEMENT_ID]: this.onMovement.bind(this),
      //@ts-ignore
      [PICKUP_GUN_ID]: this.onPickupGun.bind(this),
      //@ts-ignore
      [FIRE_BULLET_ID]: this.onFireBullet.bind(this),
      //@ts-ignore
      [EQUIP_GUN_ID]: this.onEquipGun.bind(this),
      //@ts-ignore
      [BLOCK_LINE_ID]: this.onBlockLine.bind(this),
      //@ts-ignore
      [BLOCK_BUFFER_ID]: this.onBlockBuffer.bind(this),

      [SERVER_INIT_ID]: this.badPacket.bind(this),
      [SERVER_MOVEMENT_ID]: this.badPacket.bind(this),
      [SERVER_PLAYER_JOIN_ID]: this.badPacket.bind(this),
      [SERVER_PLAYER_LEAVE_ID]: this.badPacket.bind(this),
      [SERVER_BLOCK_SINGLE_ID]: this.badPacket.bind(this),
      [SERVER_PICKUP_GUN_ID]: this.badPacket.bind(this),
      [SERVER_FIRE_BULLET_ID]: this.badPacket.bind(this),
      [SERVER_EQUIP_GUN_ID]: this.badPacket.bind(this),
      [SERVER_BLOCK_LINE_ID]: this.badPacket.bind(this),
      [SERVER_BLOCK_BUFFER_ID]: this.badPacket.bind(this),
    };

    this.users = new Map<UserId, WorldUser>();
    this._map = new BlockHandler(dbWorld, _width, _height, this.broadcast.bind(this));
  }

  // as this is the lobby, we don't need to worry about 
  async handleJoin(user: WorldUser): Promise<AllowJoin> {
    if (this.users.size >= 40) return AllowJoin.PreventJoin;

    try {
      this._map.canRun = false;

      // tell everyone else about the new player joining
      // (user not added to list yet so we can use broadcast to tell to all players except user)
      await this.broadcast({
        packetId: SERVER_PLAYER_JOIN_ID,
        userId: user.userId,
        username: user.username,
        isGuest: user.isGuest,
        joinLocation: user.lastPosition,
        hasGun: user.hasGun,
        gunEquipped: user.gunEquipped,
      });

      // tell the new user about the world
      await user.send({
        packetId: SERVER_INIT_ID,
        sender: user.userId, // TODO: deduplicate
        spawnPosition: user.lastPosition,
        size: { width: this._width, height: this._height },
        blocks: this._map.map,
        self: {
          userId: user.userId,
          username: user.username,
          isGuest: user.isGuest,
        }
      });

      for (const otherUser of this.users.values()) {
        // tell the new user about everyone here
        await user.send({
          packetId: SERVER_PLAYER_JOIN_ID,
          userId: otherUser.userId,
          username: otherUser.username,
          isGuest: otherUser.isGuest,
          joinLocation: otherUser.lastPosition,
          hasGun: otherUser.hasGun,
          gunEquipped: otherUser.gunEquipped,
        });
      }

      // add them to the list of people
      this.users.set(user.userId, user);
    }
    finally {
      this._map.canRun = true;
    }

    return AllowJoin.PermitJoin;
  }

  async handleLeave(user: WorldUser): Promise<void> {
    this.users.delete(user.userId);

    if (this.users.size === 0) {
      this.destroy();
      return;
    }

    // notify everyone that the last user has left
    await this.broadcast({
      packetId: SERVER_PLAYER_LEAVE_ID,
      userId: user.userId
    });
  }

  handleMessage(sender: WorldUser, message: WorldPacket): Promise<ValidMessage> {
    return invokeWorldPacketLookup(this._lookup, message, sender);
  }

  private badPacket(): Promise<ValidMessage> {
    return Promise.resolve(ValidMessage.IsNotValidMessage);
  }

  private onBlockSingle(packet: BlockSinglePacket, sender: WorldUser): ValidMessage {
    return this._map.handleSingle(packet, sender);
  }

  private onBlockLine(packet: BlockLinePacket, sender: WorldUser): ValidMessage {
    return this._map.handleLine(packet, sender);
  }

  private onBlockBuffer(packet: BlockBufferPacket, sender: WorldUser): ValidMessage {
    return this._map.handleBuffer(packet, sender);
  }

  private async onMovement(packet: MovementPacket, sender: WorldUser): Promise<ValidMessage> {
    // TODO: does destructuring include non-required data? if so, this could be a mild vulnerability
    sender.lastPosition = { ...packet.position };

    const response: ServerMovementPacket = {
      ...packet,
      packetId: SERVER_MOVEMENT_ID,
      sender: sender.userId,
    };

    await this.broadcast(response);

    return ValidMessage.IsValidMessage;
  }

  private async onPickupGun(packet: PickupGunPacket, sender: WorldUser): Promise<ValidMessage> {

    // TODO: make incoming schemas check for y and x out of bounds
    if (packet.position.y >= this._height || packet.position.x >= this._width) {
      sender.kill();
      return ValidMessage.IsNotValidMessage;
    }

    // only allow collection of gun if it exists at specified location
    if (this._map.map[TileLayer.Action][packet.position.y][packet.position.x].id !== TileId.Gun) {
      // we don't want to say this was invalid, because someone could've broke the gun block while someone was trying to collect it.
      return ValidMessage.IsValidMessage;
    }

    sender.hasGun = true;

    const response: ServerPickupGunPacket = {
      packetId: SERVER_PICKUP_GUN_ID,
      sender: sender.userId,
    };

    await this.broadcast(response);

    return ValidMessage.IsValidMessage;
  }

  private async onFireBullet(packet: FireBulletPacket, sender: WorldUser): Promise<ValidMessage> {

    // need to have a gun to shoot it
    if (!sender.hasGun || !sender.gunEquipped) {
      return ValidMessage.IsNotValidMessage;
    }

    const response: ServerFireBulletPacket = {
      packetId: SERVER_FIRE_BULLET_ID,
      sender: sender.userId,
      angle: packet.angle
    };

    await this.broadcast(response);

    return ValidMessage.IsValidMessage;
  }

  private async onEquipGun(packet: EquipGunPacket, sender: WorldUser): Promise<ValidMessage> {
    // need to have a gun to equip/unequip it
    if (!sender.hasGun) {
      return ValidMessage.IsNotValidMessage;
    }

    // only send a new packet if the gun's equip state changed
    if (sender.gunEquipped == packet.equipped) {
      // don't disconnect the user if they send redundant packets
      console.warn('redundant equip packet sent by', sender.userId);
      return ValidMessage.IsValidMessage;
    }

    sender.gunEquipped = packet.equipped;

    const response: ServerEquipGunPacket = {
      packetId: SERVER_EQUIP_GUN_ID,
      sender: sender.userId,
      equipped: sender.gunEquipped
    };

    await this.broadcast(response);
    return ValidMessage.IsValidMessage;
  }

  private async broadcast(packet: WorldPacket): Promise<void> {
    // let promises: Promise<void>[] = [];

    for (const user of this.users.values()) {
      await user.send(packet);
    }

    // return Promise.all(promises);
  }
}
