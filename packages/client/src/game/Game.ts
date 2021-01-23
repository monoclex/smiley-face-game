import type TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import type { ZSPacket, ZSInit, ZSEvent, ZWorldAction } from "@smiley-face-game/api/packets";
import { ZWorldActionKindReply } from "@smiley-face-game/api/types";
import Player from "./components/Player";
import World from "./World";
import Players from "./Players";
import Chat from "./Chat";
import Bullets from "./Bullets";
import Timer from "./Timer";

type GameFactory = (timer: Timer) => [Bullets, Chat, Players, World];

/**
 * `Game` class contains everything relevant for data, making it perfectly suitable
 * to use as a headless instance of a game (and thus, testing).
 */
export default class Game {
  readonly bullets: Bullets;
  readonly chat: Chat;
  readonly players: Players;
  readonly timer: Timer;
  readonly world: World;
  readonly self: Player;

  constructor(readonly tileJson: TileRegistration, readonly init: ZSInit, factory?: GameFactory) {
    factory = factory || ((timer) => [new Bullets(timer), new Chat(), new Players(), new World(tileJson, init.size)]);
    this.timer = new Timer();
    const [bullets, chat, players, world] = factory(this.timer);
    this.bullets = bullets;
    this.chat = chat;
    this.players = players;
    this.world = world;

    this.self = this.players.addPlayer({
      playerId: init.playerId,
      packetId: "SERVER_PLAYER_JOIN",
      username: init.username,
      role: init.role,
      isGuest: init.isGuest,
      joinLocation: init.spawnPosition,
      hasGun: false,
      gunEquipped: false,
    });

    this.world.load(init.blocks);
  }

  // main tick function
  /**
   * Performs one or more ticks of the game as necessary.
   * @param deltaMs The amount of milliseconds that have elapsed since the last tick.
   */
  tick(deltaMs: number) {
    // TO-DON'T: account for deltaMs and operate ticks at a fixed interval
    // ^ going to end up using LukeM physics, so no need
    for (const p of this.players) {
      p.tick(this, deltaMs);
    }

    for (const b of this.bullets) {
      b.tick();
    }
  }

  // tick sub-routines

  // message handler
  // return `1` for compile-time exauhstive typescript type checking
  handle(packet: ZSPacket): 1 {
    switch (packet.packetId) {
      case "SERVER_INIT": {
        // should never receive this, doing it for the type checking
        return 1;
      }

      case "SERVER_BLOCK_LINE": {
        this.world.placeLine(
          this.players.getPlayer(packet.playerId),
          packet.start.x,
          packet.start.y,
          packet.end.x,
          packet.end.y,
          packet.block,
          packet.layer
        );
        return 1;
      }

      case "SERVER_BLOCK_SINGLE": {
        this.world.placeBlock(
          this.players.getPlayer(packet.playerId),
          packet.position.x,
          packet.position.y,
          packet.block,
          packet.layer
        );
        return 1;
      }

      case "SERVER_CHAT": {
        this.chat.add(new Date(), this.players.getPlayer(packet.playerId), packet.message);
        return 1;
      }

      case "SERVER_EQUIP_GUN": {
        this.players.getPlayer(packet.playerId).holdGun(packet.equipped);
        return 1;
      }

      case "SERVER_EVENT": {
        this.handleEvent(packet.event);
        return 1;
      }

      case "SERVER_FIRE_BULLET": {
        // TODO: this is a hack to work around the poor design
        if (packet.playerId === this.self.id) {
          // the idea is that if a packet is received, then the client dispatches events to update
          // but in ClientAim, a client-side bullet is spawned already for the player
          // so really we need to figure out a better system to """hide lag"""
          return 1;
        }

        const player = this.players.getPlayer(packet.playerId);
        player.gunAngle = packet.angle;
        this.bullets.spawn(player, packet.angle);
        return 1;
      }

      case "SERVER_MOVEMENT": {
        const player = this.players.getPlayer(packet.playerId);
        player.position = packet.position;
        player.velocity = packet.velocity;
        player.input = packet.inputs;
        return 1;
      }

      case "SERVER_PICKUP_GUN": {
        this.players.getPlayer(packet.playerId).pickupGun();
        return 1;
      }

      case "SERVER_PLAYER_JOIN": {
        this.players.addPlayer(packet);
        return 1;
      }

      case "SERVER_PLAYER_LEAVE": {
        this.players.removePlayer(packet.playerId);
        return 1;
      }

      case "SERVER_ROLE_UPDATE": {
        this.players.getPlayer(packet.playerId).role = packet.newRole;
        return 1;
      }

      case "SERVER_WORLD_ACTION": {
        const player = this.players.getPlayer(packet.playerId);
        this.handleWorldAction(player, packet.action);
        return 1;
      }
    }
  }

  // message handling sub-routines
  handleEvent(event: ZSEvent["event"]) {
    switch (event.type) {
      case "chat rate limited": {
        this.chat.ratelimitFor(event.duration);
        return;
      }
    }
  }

  handleWorldAction(author: Player, action: ZWorldActionKindReply) {
    switch (action.action) {
      case "save": {
        this.world.onSave(author);
        return;
      }

      case "load": {
        this.world.onLoad(author, action.blocks);
        return;
      }

      case "clear": {
        this.world.onClear(author);
        return;
      }
    }
  }

  cleanup() {
    this.players.cleanup();
  }
}
