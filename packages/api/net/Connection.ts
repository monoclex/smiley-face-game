import Websocket from "isomorphic-ws";
import { Endpoint, zEndpoint, toUrl } from "./endpoints";
import type { ZJoinRequest } from "../ws-api";
import { zJoinRequest } from "../ws-api";
import {
  ZTileLayer,
  ZBlockPosition,
  ZBlock,
  ZUserId,
  ZPlayerPosition,
  ZVelocity,
  ZInputs,
  ZAngle,
  ZHeap,
  zHeap,
} from "../types";
import {
  zToken,
  zTileLayer,
  zBlock,
  zPlayerPosition,
  zVelocity,
  zInputs,
  zBlockPosition,
  zAngle,
  zMessage,
  zUserId,
} from "../types";
import inferLayer from "../inferLayer";
import type { ZSPacket, ZPacket, ZSInit } from "../packets";
import { zsInit, zPacket, zsPacket } from "../packets";
import AsyncQueue from "../AsyncQueue";
import { boolean, addParse } from "../computed-types-wrapper";
import TileRegistration from "../tiles/TileRegistration";
import createRegistration from "../tiles/createRegistration";

const zEquipped = addParse(boolean);
const zGodMode = addParse(boolean);

/** A very simple check just to make sure that a websocket is being passed in. */
function parseWebsocket(payload: unknown): payload is Websocket {
  if (typeof payload === "object" && payload !== null && "send" in payload) {
    return true;
  }

  return false;
}

export default class Connection {
  /**
   * Makes a connection to Smiley Face Game.
   * @param endpoint The websocket endpoint to establish a connection with.
   * @param token The token to use when connecting.
   * @param joinRequest The join request to supply when making the connection.
   */
  static establish(
    endpoint: Endpoint,
    token: string,
    joinRequest: ZJoinRequest
  ): Promise<Connection>;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  static establish(
    argEndpoint: unknown,
    argToken: unknown,
    argJoinRequest: unknown
  ): Promise<Connection> {
    const endpoint = zEndpoint.parse(argEndpoint);
    const token = zToken.parse(argToken);
    const joinRequest = zJoinRequest.parse(argJoinRequest);

    const url = toUrl(endpoint, true);
    url.searchParams.append("token", token);
    url.searchParams.append("world", JSON.stringify(joinRequest));

    return new Promise((resolve, reject) => {
      const websocket = new Websocket(url.href);

      // we've created a websocket, but did we really join?
      // listen for either 'init' or an error
      websocket.onclose = (e) => reject(new Error("WebSocket Rejection Error: " + e.reason));
      websocket.onmessage = (e) => resolve(new Connection(websocket, JSON.parse(e.data as string)));
    });
  }

  /**
   * The validator for a `BlockPosition`.
   */
  readonly zBlockPosition: ReturnType<typeof zBlockPosition>;

  /**
   * The validator for packets sent from the server.
   */
  readonly zsPacket: ReturnType<typeof zsPacket>;

  /**
   * The validator for packets sent from this client. This is so that friendly error messages are given to the client
   * incase an invalid packet is sent.
   */
  readonly zPacket: ReturnType<typeof zPacket>;

  /**
   * The websocket that the underlying connection is using. It is not recommended to use this, but you can if you must.
   */
  readonly websocket: Websocket;

  /**
   * The `init` packet sent to the server. `Connection` guarantees that you will have received `init` by the time
   */
  readonly init: ZSInit;

  /**
   * A data structure used to convert the callback nature of a websocket into an easy `for await` loop for the user.
   */
  readonly messages: AsyncQueue<ZSPacket>;

  /**
   * The state for registered tiles.
   */
  readonly tileJson: TileRegistration;

  private _connected = true;

  /**
   * Gets whether or not this connection is connected.
   */
  get connected(): boolean {
    return this._connected;
  }

  /**
   * Constructs a new `Connection`, given a `websocket` and an `init` message.
   * @param websocket The websocket that the connection is on.
   * @param init The payload of the `init` message.
   */
  constructor(websocket: Websocket, init: ZSInit);

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  constructor(argWebsocket: unknown, argInit: unknown) {
    if (parseWebsocket(argWebsocket)) this.websocket = argWebsocket;
    else throw new Error(`Failed to interpret argument as 'Websocket'.`);
    this.init = zsInit.parse(argInit);
    this.tileJson = createRegistration(this.init.tiles);

    this.messages = new AsyncQueue();

    const { width, height } = this.init.size;
    this.zBlockPosition = zBlockPosition(width, height);
    this.zPacket = zPacket(width, height);
    this.zsPacket = zsPacket(width, height);

    // this serves to both unhook the websocket.close from the promise earlier, and as a catch-all incase `onerror`
    // doesn't get something
    this.websocket.onclose = (event) => (
      (this._connected = false), this.messages.end(new Error(event.reason))
    );
    this.websocket.onerror = (event) => ((this._connected = false), this.messages.end(event.error));
    this.websocket.onmessage = (event) =>
      this.messages.push(this.zsPacket.parse(JSON.parse(event.data as string)));
  }

  /**
   * Allows asynchronous iteration over this `Connection`. This allows the user to use a simple for loop to iterate
   * over every message, and makes the control flow and life of their application inherently more vivid.
   */
  [Symbol.asyncIterator]() {
    const next: () => Promise<{ done: false; value: ZSPacket } | { done: true }> = () =>
      this.messages.next().then((value) => (value ? { value, done: false } : { done: true }));
    return { next };
  }

  /**
   * Kills the connection.
   */
  close() {
    this._connected = false;
    this.messages.end(new Error("connection closing"));
    this.websocket.close();
  }

  /**
   * Sends a raw packet to the server. This method may be a bit more verbose than one would like, so consider any of
   * the overload helper methods to make your code more clear and less dependent on the exact implementation of the
   * packet structure.
   * @param packet The packet to send to the server.
   */
  send(packet: ZPacket): void;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  send(argPacket: unknown) {
    const packet = this.zPacket.parse(argPacket);
    this._send(packet);
  }

  /**
   * @package
   * Sends a raw packet on the websocket, without checking if it is valid. This is NOT meant to be used by consumers.
   * This is just so that helper methods (such as `place`) don't have to go through `send`'s validation, for a marginal
   * (but albeit un-necessary) speed boost. This is generally recommended for any paths that have already been type
   * checked.
   * @param packet The packet to send on the wire.
   */
  private _send(packet: ZPacket) {
    this.websocket.send(JSON.stringify(packet));
  }

  /**
   * Sends a movement packet.
   * @param position The position the player is at.
   * @param velocity The current velocity of the player.
   * @param inputs The inputs the player is pressing.
   */
  move(position: ZPlayerPosition, velocity: ZVelocity, inputs: ZInputs): void;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  move(argPosition: unknown, argVelocity: unknown, argInputs: unknown) {
    const position = zPlayerPosition.parse(argPosition);
    const velocity = zVelocity.parse(argVelocity);
    const inputs = zInputs.parse(argInputs);

    this._send({
      packetId: "MOVEMENT",
      position,
      velocity,
      inputs,
    });
  }

  /**
   * Sends a packet to pick up a gun. Picking up a gun occurs when the player walks over a gun block. From there, the
   * gun is automatically equipped so the player can start shooting. If the player presses `E`, the gun gets un-equipped
   * and can go back to editing, or can re-equip it by pressing `E` again.
   * @param position The position of the gun block to pickup.
   */
  pickupGun(position: ZBlockPosition): void;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  pickupGun(argPosition: unknown) {
    const position = this.zBlockPosition.parse(argPosition);

    this._send({
      packetId: "PICKUP_GUN",
      position,
    });
  }

  /**
   * Equips a gun. Equipping a gun is when the player is holding a gun, and on pressing on the screen they will start
   * firing their gun. Picking up a gun happens when the player walks over a gun block to receive a gun.
   * @param equipped Whether the gun should be equipped or not.
   */
  equipGun(equipped: boolean): void;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  equipGun(argEquipped: unknown) {
    const equipped = zEquipped.parse(argEquipped);

    this._send({
      packetId: "EQUIP_GUN",
      equipped,
    });
  }

  /**
   * Fires a bullet. If the player doesn't have a gun equipped, you may get disconnected.
   * @param angle The angle to fire the bullet at.
   */
  fireBullet(angle: ZAngle): void;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  fireBullet(argAngle: unknown) {
    const angle = zAngle.parse(argAngle);

    this._send({
      packetId: "FIRE_BULLET",
      angle,
    });
  }

  // TODO: `heap` should be before `layer` as that's more important
  //   luckily users can still put `undefined` for the layer tho
  //   not changing it rn to not break backwards compat
  /**
   * Places a block in the world.
   * @param block The block to place.
   * @param position The position to place the block at.
   * @param layer The layer to place the block on.
   * @param heap The heap associated data with the block, if any.
   */
  place(block: ZBlock, position: ZBlockPosition, heap?: ZHeap, layer?: ZTileLayer): void;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  place(argBlock: unknown, argPosition: unknown, argHeap?: unknown, argLayer?: unknown) {
    const block = zBlock.parse(argBlock);
    const position = this.zBlockPosition.parse(argPosition);

    const packet: ZPacket = {
      packetId: "BLOCK_SINGLE",
      position,
      block,
    };

    if (argLayer) {
      const layer = zTileLayer.parse(argLayer);

      if (inferLayer(this.tileJson, block) !== layer) {
        packet.layer = layer;
      }
    }

    if (argHeap) {
      const heap = zHeap.parse(argHeap);
      packet.heap = heap;
    }

    this._send(packet);
  }

  /**
   * Places a line of blocks in the world.
   * @param block The block to place.
   * @param start The starting position.
   * @param end The ending position.
   * @param layer The layer to place the block on.
   * @param heap The heap associated data with the block, if any.
   */
  placeLine(
    block: ZBlock,
    start: ZBlockPosition,
    end: ZBlockPosition,
    heap?: ZHeap,
    layer?: ZTileLayer
  ): void;

  placeLine(
    argBlock: unknown,
    argStart: unknown,
    argEnd: unknown,
    argHeap?: unknown,
    argLayer?: unknown
  ) {
    const block = zBlock.parse(argBlock);
    const start = this.zBlockPosition.parse(argStart);
    const end = this.zBlockPosition.parse(argEnd);

    const packet: ZPacket = {
      packetId: "BLOCK_LINE",
      block,
      start,
      end,
    };

    if (argLayer) {
      const layer = zTileLayer.parse(argLayer);

      if (inferLayer(this.tileJson, block) !== layer) {
        packet.layer = layer;
      }
    }

    if (argHeap) {
      const heap = zHeap.parse(argHeap);
      packet.heap = heap;
    }

    this._send(packet);
  }

  /**
   * Sends a chat message.
   * @param message The message to send to chat.
   */
  chat(message: string): void;

  chat(argMessage: unknown) {
    const message = zMessage.parse(argMessage);

    this._send({
      packetId: "CHAT",
      message,
    });
  }

  /**
   * Gives edit to a player. This may cause you to disconnect if you are not the owner.
   * @param playerId The ID of the player to give edit to.
   */
  giveEdit(playerId: ZUserId): void;

  giveEdit(argPlayerId: unknown) {
    const playerId = zUserId.parse(argPlayerId);

    this._send({
      packetId: "PLAYER_LIST_ACTION",
      action: { action: "give edit", playerId },
    });
  }

  /**
   * Takes edit from a player. This may cause you to disconnect if you are not the owner.
   * @param playerId The ID of the player to take edit from.
   */
  takeEdit(playerId: ZUserId): void;

  takeEdit(argPlayerId: unknown) {
    const playerId = zUserId.parse(argPlayerId);

    this._send({
      packetId: "PLAYER_LIST_ACTION",
      action: { action: "remove edit", playerId },
    });
  }

  /**
   * Kicks a player from your world. This may cause you to disconnect if you are not the owner.
   * @param playerId The ID of the player to kick.
   */
  kick(playerId: ZUserId): void;

  kick(argPlayerId: unknown) {
    const playerId = zUserId.parse(argPlayerId);

    this._send({
      packetId: "PLAYER_LIST_ACTION",
      action: { action: "kick", playerId },
    });
  }

  /**
   * Sends a packet to the server to enable or disable god mode. It is assumed you already
   * know whether or not god mode is possible, so only send packets when you do. If you send
   * a god mode packet "correctly", you will not hear anything back from the server (but
   * other players will). If you send it incorrectly, you will hear a god mode packet back
   * from the server.
   * @param godMode If god mode should be enabled or not
   */
  toggleGod(godMode: boolean): void;

  toggleGod(argGodMode: unknown) {
    const godMode = zGodMode.parse(argGodMode);

    this._send({
      packetId: "TOGGLE_GOD",
      god: godMode,
    });
  }

  /**
   * Clears the world. This may cause you to disconnect if you are not the owner.
   */
  clear() {
    this._send({
      packetId: "WORLD_ACTION",
      action: { action: "clear" },
    });
  }

  /**
   * Saves the world. This may cause you to disconnect if you are not the owner.
   */
  save() {
    this._send({
      packetId: "WORLD_ACTION",
      action: { action: "save" },
    });
  }

  /**
   * Loads the world. This may cause you to disconnect if you are not the owner.
   */
  load() {
    this._send({
      packetId: "WORLD_ACTION",
      action: { action: "load" },
    });
  }

  /**
   * Touches a red key. Players receive the ID of the user triggering a key touch, and the time at which the key effect is to wear off.
   */
  touchRedKey() {
    this._send({
      packetId: "KEY_TOUCH",
      kind: "red",
    });
  }
}
