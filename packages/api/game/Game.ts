import { Connection, ZSPacket } from "..";
import type { ZSEvent, ZSInit, ZSWorldAction } from "../packets";
import { Blocks } from "./Blocks";
import { EEPhysics } from "../physics/EEPhysics";
import { Players } from "./Players";
import { Vector } from "../physics/Vector";
import TileRegistration from "../tiles/TileRegistration";

export const EE_TPS = 100;

/**
 * A `Game` is a class that handles running a Smiley Face Game world. This is the
 * same code that gets used on the client. This is great news for developers, as now
 * bots that depend upon in game physics may be more common.
 */
export class Game {
  readonly tiles: TileRegistration;
  readonly players: Players;
  readonly blocks: Blocks;
  readonly physics: EEPhysics;

  // TODO: have a `world` variable or something
  worldTitle: string = "";

  constructor(connection: Connection);
  constructor(tiles: TileRegistration, init: ZSInit);
  constructor(tiles: TileRegistration, players: Players, blocks: Blocks, physics: EEPhysics);

  constructor(
    tilesOrConn: TileRegistration | Connection,
    a?: Players | ZSInit,
    b?: Blocks,
    c?: EEPhysics
  ) {
    if (tilesOrConn instanceof Connection) {
      // constructor(connection: Connection);
      const connection = tilesOrConn;
      const init = connection.init;
      const size = new Vector(init.size.width, init.size.height);

      this.tiles = connection.tileJson;
      this.players = new Players(init);
      this.blocks = new Blocks(this.tiles, init.blocks, init.heaps, size);
      this.physics = new EEPhysics(this.tiles, this.blocks, EE_TPS);

      this.handleEvent({
        playerId: init.playerId,
        packetId: "SERVER_PLAYER_JOIN",
        username: init.username,
        role: init.role,
        isGuest: init.isGuest,
        joinLocation: init.spawnPosition,
        hasGun: false,
        gunEquipped: false,
        canGod: init.canGod,
        inGod: false,
      });
    } else if (a instanceof Players && b != null && c != null) {
      // constructor(tiles: TileRegistration, players: Players, blocks: Blocks, physics: EEPhysics);
      this.tiles = tilesOrConn;
      this.players = a;
      this.blocks = b;
      this.physics = c;
    } else if (!(a instanceof Players) && a) {
      // constructor(tiles: TileRegistration, init: ZSInit);
      const init = a;

      this.tiles = tilesOrConn;
      this.players = new Players(init);
      this.blocks = new Blocks(
        tilesOrConn,
        init.blocks,
        init.heaps,
        new Vector(init.size.width, init.size.height)
      );
      this.physics = new EEPhysics(tilesOrConn, this.blocks, EE_TPS);
    } else {
      throw new Error("Failed to construct game, given incorrect arguments");
    }
  }

  update(elapsedMs: number) {
    this.physics.update(elapsedMs, this.players.list);
  }

  tick() {
    this.physics.tick(this.players.list);
  }

  // this returns `0` to make sure all branches are fulfilled
  handleEvent(event: ZSPacket): 0 {
    // as a general rule of thumb, this method should be a *dispatching method*.
    // any sort of logic should be *dispatched* to a specific component or part of the game.
    // from there, all logic should be handled. this ensures that it's possible for users
    // to directly influence the state of the game via natural api interactions, while
    // also providing an api to let network events influence the state of the game as necessary.

    switch (event.packetId) {
      case "SERVER_BLOCK_LINE":
        this.blocks.placeLine(
          event.layer,
          event.start,
          event.end,
          event.block,
          event.playerId,
          event.heap
        );
        return 0;
      case "SERVER_BLOCK_SINGLE":
        this.blocks.placeSingle(
          event.layer,
          event.position,
          event.block,
          event.playerId,
          event.heap
        );
        return 0;
      case "SERVER_CHAT":
        // game doesn't need to handle chat
        return 0;
      case "SERVER_EQUIP_GUN":
        // guns are currently unimplemented
        return 0;
      case "SERVER_FIRE_BULLET":
        // guns are currently unimplemented
        return 0;
      case "SERVER_INIT":
        throw new Error(`unexpected packet '${event.packetId}'`);
      case "SERVER_KEY_TOUCH":
        this.physics.keys.trigger(
          event.kind,
          event.deactivateTime,
          this.players.get(event.playerId)
        );
        return 0;
      case "SERVER_MOVEMENT":
        this.physics.updatePlayer(event, this.players.get(event.playerId));
        return 0;
      case "SERVER_PICKUP_GUN":
        // guns are currently unimplemented
        return 0;
      case "SERVER_PLAYER_JOIN":
        this.players.add(event);
        return 0;
      case "SERVER_PLAYER_LEAVE":
        this.players.remove(event.playerId);
        return 0;
      case "SERVER_ROLE_UPDATE":
        this.players.updatePerms(event);
        return 0;
      case "SERVER_TOGGLE_GOD":
        this.players.get(event.playerId).isInGodMode = event.god;
        return 0;
      case "SERVER_TELEPORT_PLAYER":
        this.players.get(event.teleportedPlayerId).handleTeleport(event);
        return 0;
      case "SERVER_WORLD_ACTION":
        return this.handleWorldAction(event);
      case "SERVER_EVENT":
        return this.handleServerEvent(event);
    }
  }

  // we have to split these up into their own functinos
  // otherwise i run into eslint and typescript stepping on each others toes
  // ^ cuz of case fallthrough + wanting all branches to return 0

  handleWorldAction({ action }: ZSWorldAction): 0 {
    switch (action.action) {
      case "clear":
        this.blocks.clear();
        return 0;
      case "load":
        this.blocks.load(action.blocks, action.heaps);
        return 0;
      case "save":
        // nothing needs to happen on save
        return 0;
      case "change title":
        this.worldTitle = action.title;
        return 0;
    }
  }

  handleServerEvent({ event }: ZSEvent): 0 {
    switch (event.type) {
      case "chat rate limited":
        // game doesn't need to handle chat
        return 0;
    }
  }
}
