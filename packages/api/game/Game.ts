import { ZSPacket } from "..";
import type { ZSEvent, ZSInit, ZSWorldAction } from "../packets";
import { Blocks } from "./Blocks";
import { EEPhysics } from "../physics/ee/EEPhysics";
import { PhysicsSystem } from "../physics/PhysicsSystem";
import { Players } from "./Players";
import { Vector } from "../physics/Vector";
import TileRegistration from "../tiles/TileRegistration";

const EE_TPS = 100;

/**
 * A `Game` is a class that handles running a Smiley Face Game world. This is the
 * same code that gets used on the client. This is great news for developers, as now
 * bots that depend upon in game physics may be more common.
 */
export class Game {
  readonly players: Players;
  readonly blocks: Blocks;
  readonly physics: PhysicsSystem;

  constructor(readonly tiles: TileRegistration, init: ZSInit) {
    this.players = new Players(init);
    this.blocks = new Blocks(
      tiles,
      init.blocks,
      init.heaps,
      new Vector(init.size.width, init.size.height)
    );
    this.physics = new EEPhysics(tiles, this.blocks, EE_TPS);
  }

  update(elapsedMs: number) {
    this.physics.update(elapsedMs, this.players.list);
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
        this.physics.triggerKey(event.kind, event.deactivateTime, this.players.get(event.playerId));
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
        this.players.updateRole(event.playerId, event.newRole);
        return 0;
      case "SERVER_TOGGLE_GOD":
        this.players.get(event.playerId).isInGodMode = event.god;
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
