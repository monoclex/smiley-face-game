import type TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import type { ZSPacket, ZSInit, ZSEvent, ZSPlayerJoin, ZWorldAction } from "@smiley-face-game/api/packets";
import { TileLayer, ZWorldActionKindReply } from "@smiley-face-game/api/types";
import { bresenhamsLine } from "@smiley-face-game/api/misc";
import { Connection } from "@smiley-face-game/api";

interface Position {
  x: number;
  y: number;
}

type Velocity = Position;

interface Size {
  width: number;
  height: number;
}

interface Inputs {
  jump: boolean;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

enum GunState {
  None,
  Carrying,
  Held,
}

interface PhysicsObject {
  position: Position;
  velocity: Velocity;
  tick?: () => void;
}

interface BulletCtor {
  new (x: number, y: number, angle: number): Bullet;
}
export class Bullet implements PhysicsObject {
  creation: Date = new Date();
  position: Position;
  velocity: Velocity;

  constructor(x: number, y: number, angle: number) {
    const startingPower = 32;
    this.position = { x, y };
    this.velocity = {
      x: Math.cos(angle) * startingPower,
      y: Math.sin(angle) * startingPower,
    };
  }

  tick() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

interface PlayerCtor {
  new (username: string, isGuest: boolean): Player;
}
export class Player implements PhysicsObject {
  position: Position = { x: 0, y: 0 };
  velocity: Velocity = { x: 0, y: 0 };
  input: Inputs = { jump: false, up: false, down: false, left: false, right: false };
  role: "non" | "edit" | "staff" | "owner" = "non"; // TODO: remove role in favor of permission based stuff
  private gunState: GunState = 0;

  get hasGun(): boolean {
    return this.gunState >= GunState.Carrying;
  }

  get isGunHeld(): boolean {
    return this.gunState === GunState.Held;
  }

  get hasEdit(): boolean {
    return this.role === "edit" || this.role === "owner";
  }

  constructor(readonly username: string, readonly isGuest: boolean) {}

  pickupGun() {
    if (this.hasGun) throw new Error("picked up gun when already have a gun");
    this.gunState = GunState.Carrying;
  }

  holdGun(isHeld: boolean) {
    if (!this.hasGun) throw new Error("can't hold gun when there is no gun");
    this.gunState = isHeld ? GunState.Held : GunState.Carrying;
  }

  tick() {
    // stupidly simple physics just so we can prototype for now
    // fancy stuff coming later <3
    this.velocity.x = 0;
    this.velocity.y = 0;
    if (this.input.up) this.velocity.y++;
    if (this.input.down) this.velocity.y--;
    if (this.input.left) this.velocity.x--;
    if (this.input.right) this.velocity.x++;
    this.position.x += this.velocity.x * 16;
    this.position.y += this.velocity.y * 16;
  }

  destroy() {
    // TODO: run code that needs to be run on deletion
  }
}

export class World {
  private state: number[][][];

  private static emptyWorld(size: Size): number[][][] {
    const state = [];

    for (let idxLayer = TileLayer.Foreground; idxLayer <= TileLayer.Decoration; idxLayer++) {
      const layer = [];
      for (let idxY = 0; idxY < size.height; idxY++) {
        const y = [];
        for (let idxX = 0; idxX < size.width; idxX++) {
          y[idxX] = 0;
        }
        layer[idxY] = y;
      }
      state[idxLayer] = layer;
    }

    return state;
  }

  private static placeBorder(state: number[][][], tileJson: TileRegistration, size: Size) {
    const layer = state[TileLayer.Foreground];
    const block = tileJson.id("basic-white");

    const top = layer[0];
    const bottom = layer[size.height - 1];

    for (let x = 0; x < size.width; x++) {
      top[x] = bottom[x] = block;
    }

    const rightEndOfWorld = size.width - 1;
    for (let idxY = 1; idxY < size.height - 2; idxY++) {
      const y = layer[idxY];
      y[0] = y[rightEndOfWorld] = block;
    }
  }

  constructor(private readonly tileJson: TileRegistration, readonly size: Size) {
    this.state = World.emptyWorld(size);
  }

  placeBlock(author: Player, x: number, y: number, id: number, layer?: number) {
    layer = layer ?? this.tileJson.for(id).layer;
    this.state[layer][y][x] = id;
  }

  placeLine(author: Player, x1: number, y1: number, x2: number, y2: number, id: number, layer?: number) {
    layer = layer ?? this.tileJson.for(id).layer;
    const stateLayer = this.state[layer];
    bresenhamsLine(x1, y1, x2, y2, (x, y) => {
      stateLayer[y][x] = id;
    });
  }

  load(blocks: number[][][]) {
    this.state = blocks;
  }

  clear() {
    this.state = World.emptyWorld(this.size);
    World.placeBorder(this.state, this.tileJson, this.size);
  }

  onSave(author: Player) {}

  onLoad(author: Player, blocks: number[][][]) {
    this.load(blocks);
  }

  onClear(author: Player) {
    this.clear();
  }
}

interface Message {
  // id is for react
  id: number;
  time: Date;
  // TODO: don't use `Player` so that the GC can pick up old players, use a
  // smaller version of `Player` that carries enough information about the
  // player to render them (e.g. role/name is all)
  sender: Player;
  content: string;
}

export class Bullets {
  private readonly bullets: Bullet[] = [];
  private readonly B: BulletCtor;

  constructor(constructor?: BulletCtor) {
    this.B = constructor || Bullet;
  }

  spawn(at: Player, angle: number) {
    // TODO: put bullet in front of gun
    const bullet = new this.B(at.position.x, at.position.y, angle);
    this.bullets.push(bullet);
  }

  [Symbol.iterator]() {
    return this.bullets[Symbol.iterator]();
  }
}

export class Chat {
  private _atTimeCanSend: Date = new Date();
  private readonly _messages: Message[] = [];
  private _topId: number = 0;

  get messages(): Iterable<Message> {
    return this._messages;
  }

  get topId(): number {
    return this._topId;
  }

  add(time: Date, sender: Player, message: string) {
    this._messages.push({ id: this._topId++, time, sender, content: message });
  }

  ratelimitFor(durationMs: number) {
    this._atTimeCanSend = new Date();
    this._atTimeCanSend.setTime(this._atTimeCanSend.getTime() + durationMs);
  }
}

export class Players {
  private readonly _map: Map<number, Player> = new Map();
  private readonly P: PlayerCtor;

  constructor(constructor?: PlayerCtor) {
    this.P = constructor || Player;
  }

  getPlayer(id: number): Player {
    const player = this._map.get(id);
    if (!player) throw new Error(`getPlayer failed with id ${id}`);
    return player;
  }

  addPlayer(joinInfo: ZSPlayerJoin): Player {
    const player = new this.P(joinInfo.username, joinInfo.isGuest);

    player.role = joinInfo.role;
    player.position = joinInfo.joinLocation;

    if (joinInfo.hasGun) {
      player.pickupGun();

      if (joinInfo.gunEquipped) {
        player.holdGun(true);
      }
    }

    this._map.set(joinInfo.playerId, player);
    return player;
  }

  removePlayer(id: number): Player {
    const player = this.getPlayer(id);
    player.destroy();
    this._map.delete(id);
    return player;
  }

  [Symbol.iterator]() {
    return this._map.values();
  }
}

type GameFactory = (tileJson: TileRegistration, init: ZSInit) => [Bullets, Chat, Display | undefined, Players, World];
const defaultGameFactory: GameFactory = (tileJson, init) => [
  new Bullets(),
  new Chat(),
  undefined,
  new Players(),
  new World(tileJson, init.size),
];

export interface Display {
  draw(): void;
}

/**
 * `Game` class contains everything relevant for data, making it perfectly suitable
 * to use as a headless instance of a game (and thus, testing).
 */
export class Game {
  readonly bullets: Bullets;
  readonly chat: Chat;
  readonly display: Display | undefined;
  readonly players: Players;
  readonly world: World;
  readonly self: Player;

  constructor(readonly tileJson: TileRegistration, readonly init: ZSInit, factory?: GameFactory) {
    factory = factory || defaultGameFactory;
    const [bullets, chat, display, players, world] = factory(tileJson, init);
    this.bullets = bullets;
    this.chat = chat;
    this.display = display;
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
  }

  // main tick function
  /**
   * Performs one or more ticks of the game as necessary.
   * @param deltaMs The amount of milliseconds that have elapsed since the last tick.
   */
  tick(deltaMs: number) {
    // TODO: account for deltaMs and operate ticks at a fixed interval
    for (const p of this.players) {
      p.tick();
    }

    for (const b of this.bullets) {
      b.tick();
    }

    // once we process *all* physics ticks as necessary, *then* we draw
    this.display?.draw();
  }

  // tick sub-routines

  // message handler
  handle(packet: ZSPacket) {
    switch (packet.packetId) {
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
        return;
      }

      case "SERVER_BLOCK_SINGLE": {
        this.world.placeBlock(
          this.players.getPlayer(packet.playerId),
          packet.position.x,
          packet.position.y,
          packet.block,
          packet.layer
        );
        return;
      }

      case "SERVER_CHAT": {
        this.chat.add(new Date(), this.players.getPlayer(packet.playerId), packet.message);
        return;
      }

      case "SERVER_EQUIP_GUN": {
        this.players.getPlayer(packet.playerId).holdGun(packet.equipped);
        return;
      }

      case "SERVER_EVENT": {
        this.handleEvent(packet.event);
        return;
      }

      case "SERVER_FIRE_BULLET": {
        this.bullets.spawn(this.players.getPlayer(packet.playerId), packet.angle);
        return;
      }

      case "SERVER_MOVEMENT": {
        const player = this.players.getPlayer(packet.playerId);
        player.position = packet.position;
        player.velocity = packet.velocity;
        player.input = packet.inputs;
        return;
      }

      case "SERVER_PICKUP_GUN": {
        this.players.getPlayer(packet.playerId).pickupGun();
        return;
      }

      case "SERVER_PLAYER_JOIN": {
        this.players.addPlayer(packet);
        return;
      }

      case "SERVER_PLAYER_LEAVE": {
        this.players.removePlayer(packet.playerId);
        return;
      }

      case "SERVER_ROLE_UPDATE": {
        this.players.getPlayer(packet.playerId).role = packet.newRole;
        return;
      }

      case "SERVER_WORLD_ACTION": {
        const player = this.players.getPlayer(packet.playerId);
        this.handleWorldAction(player, packet.action);
        return;
      }

      // TODO: let typescript yell at us if we don't cover all edgecases
      default: {
        throw new Error(`unimplemented packet type ${packet.packetId}`);
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
}
