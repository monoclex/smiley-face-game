import type { ZSPlayerJoin } from "@smiley-face-game/api/packets";
import type { Connection } from "@smiley-face-game/api";
import { Container, Sprite, Renderer, Texture, DisplayObject, TilingSprite, Rectangle } from "pixi.js";
import {
  Game,
  Bullets,
  Players,
  Chat,
  World,
  Bullet,
  Player,
  Size,
  Inputs,
  Network,
  Display,
  defaultInputs,
} from "./Game";
import playerUrl from "../assets/base.png";
import bulletUrl from "../assets/bullet.png";
import atlasUrl from "../assets/atlas.png";
import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import { CompositeRectTileLayer } from "pixi-tilemap";
import atlasJson from "../assets/atlas_atlas.json";
import { TileLayer } from "@smiley-face-game/api/types";

function newCompositeRectTileLayer(zIndex?: number, bitmaps?: any[]): CompositeRectTileLayer & DisplayObject {
  // for some reason, pixi-tilemap compositerecttilelayers are valid
  // DisplayObjects but because pixi-tilemap imports @pixi/things instead of
  // pixi.js, it doesn't have valid typings for whatever reason... hacky
  // workarounds ftw!
  // @ts-ignore
  return new CompositeRectTileLayer(zIndex, bitmaps);
}

export const textures = new (class {
  private _bullet: Texture | undefined;
  get bullet(): Texture {
    if (!this._bullet) throw new Error("`bullet` texture not loaded");
    return this._bullet;
  }

  private _player: Texture | undefined;
  get player(): Texture {
    if (!this._player) throw new Error("`player` texture not loaded");
    return this._player;
  }

  private _atlas: Texture | undefined;
  get atlas(): Texture {
    if (!this._atlas) throw new Error("`atlas` texture not loaded");
    return this._atlas;
  }

  private readonly _blockCache: Map<string, Texture> = new Map();
  block(name: string): Texture {
    const blockCacheResult = this._blockCache.get(name);
    if (blockCacheResult !== undefined) {
      return blockCacheResult;
    }

    for (const frame of atlasJson.frames) {
      if (frame.filename === name) {
        const texture = new Texture(
          this.atlas.baseTexture,
          new Rectangle(frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h)
        );
        this._blockCache.set(name, texture);
        return texture;
      }
    }
    throw new Error("couldn't find texture " + name);
  }

  load(): Promise<void> {
    return Promise.all([playerUrl, bulletUrl, atlasUrl])
      .then((urls) => Promise.all(urls.map(Texture.fromURL)))
      .then(([player, bullet, atlas]) => {
        this._player = player;
        this._bullet = bullet;
        this._atlas = atlas;
      });
  }
})();

export class ClientBullet extends Bullet {
  sprite: Sprite;

  constructor(x: number, y: number, angle: number) {
    super(x, y, angle);
    this.sprite = new Sprite(textures.bullet);
  }

  tick() {
    super.tick();
    this.sprite.position.x = this.position.x;
    this.sprite.position.y = this.position.y;
  }
}

function areSame(a: Inputs, b: Inputs) {
  return a.up === b.up && a.down === b.down && a.left === b.left && a.right === b.right && a.jump === b.jump;
}

export class ClientPlayer extends Player {
  sprite: Sprite;

  constructor(username: string, isGuest: boolean) {
    super(username, isGuest);
    this.sprite = new Sprite(textures.player);
  }

  tick() {
    super.tick();
    this.sprite.position.x = this.position.x;
    this.sprite.position.y = this.position.y;
  }
}

export class ClientPlayers extends Players {
  constructor(readonly players: Container) {
    super(ClientPlayer);
  }

  addPlayer(joinInfo: ZSPlayerJoin): ClientPlayer {
    const player = super.addPlayer(joinInfo) as ClientPlayer;
    this.players.addChildAt(player.sprite, 0);
    return player;
  }

  removePlayer(id: number): ClientPlayer {
    const player = super.removePlayer(id) as ClientPlayer;
    this.players.removeChild(player.sprite);
    return player;
  }
}

export class ClientWorld extends World {
  private readonly void: TilingSprite;
  private readonly background: CompositeRectTileLayer & DisplayObject;
  private readonly action: CompositeRectTileLayer & DisplayObject;
  private readonly foreground: CompositeRectTileLayer & DisplayObject;
  private readonly decoration: CompositeRectTileLayer & DisplayObject;

  constructor(tileJson: TileRegistration, size: Size, worldBehind: Container, worldInfront: Container) {
    super(tileJson, size);
    this.void = new TilingSprite(textures.block("empty"), size.width * 32, size.height * 32);
    this.background = newCompositeRectTileLayer();
    this.action = newCompositeRectTileLayer();
    this.foreground = newCompositeRectTileLayer();
    this.decoration = newCompositeRectTileLayer();
    worldBehind.addChild(this.void);
    worldBehind.addChild(this.background);
    worldBehind.addChild(this.action);
    worldBehind.addChild(this.foreground);
    worldInfront.addChild(this.decoration);
  }

  load(blocks: number[][][]) {
    super.load(blocks);
    this.action.clear();
    this.foreground.clear();

    const map = {
      [TileLayer.Foreground]: this.foreground,
      [TileLayer.Action]: this.action,
    };

    for (let layerIdx = TileLayer.Foreground; layerIdx <= TileLayer.Decoration; layerIdx++) {
      const layer = blocks[layerIdx];
      //@ts-ignore
      const tileLayer = map[layerIdx];
      if (tileLayer === undefined) continue;
      for (let yIdx = 0; yIdx < this.size.height; yIdx++) {
        const y = layer[yIdx];
        for (let x = 0; x < this.size.width; x++) {
          if (y[x] === 0) continue;
          const textureName = this.tileJson.texture(y[x]);
          tileLayer.addFrame(textures.block(textureName), x * 32, yIdx * 32);
        }
      }
    }
  }
}

export class ClientNetwork implements Network {
  private mainPlayerOldInputs: Inputs = defaultInputs();

  constructor(private readonly connection: Connection) {}

  update(game: Game): void {
    if (!areSame(game.self.input, this.mainPlayerOldInputs)) {
      this.connection.move(game.self.position, game.self.velocity, game.self.input);
      this.mainPlayerOldInputs = { ...game.self.input };
    }
  }
}

export class ClientDisplay implements Display {
  readonly root: Container = new Container();
  readonly worldBehind: Container = new Container();
  readonly players: Container = new Container();
  readonly bullets: Container = new Container();
  readonly worldInfront: Container = new Container();

  constructor(private readonly renderer: Renderer) {
    this.root.addChild(this.worldBehind); // <-- most behind
    this.root.addChild(this.players);
    this.root.addChild(this.bullets);
    this.root.addChild(this.worldInfront); // <-- closest to viewer
  }

  draw(game: Game): void {
    // calculate position for player to be in the center
    const HALF_PLAYER_SIZE = 16;
    const centerX = -game.self.position.x - HALF_PLAYER_SIZE + this.renderer.width / 2;
    const centerY = -game.self.position.y - HALF_PLAYER_SIZE + this.renderer.height / 2;

    // calc some camera lag
    const CAMERA_LAG_MODIFIER = 1 / 16;
    const cameraLagX = (centerX - this.root.position.x) * CAMERA_LAG_MODIFIER;
    const cameraLagY = (centerY - this.root.position.y) * CAMERA_LAG_MODIFIER;

    // apply the camera lag
    this.root.position.x += cameraLagX;
    this.root.position.y += cameraLagY;
    this.renderer.render(this.root);
  }
}

export function makeClientConnectedGame(renderer: Renderer, connection: Connection): Game {
  const display = new ClientDisplay(renderer);
  const game = new Game(connection.tileJson, connection.init, (tileJson, init) => [
    new Bullets(ClientBullet),
    new Chat(),
    display,
    new ClientNetwork(connection),
    new ClientPlayers(display.players),
    new ClientWorld(tileJson, init.size, display.worldBehind, display.worldInfront),
  ]);

  for (const playerInfo of connection.init.players) {
    game.players.addPlayer(playerInfo);
  }

  messagesTask();
  async function messagesTask() {
    for await (const message of connection) {
      game.handle(message);
    }
  }

  // TODO: do this nicely?
  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    switch (key) {
      case "w":
        game.self.input.up = true;
        break;
      case "d":
        game.self.input.right = true;
        break;
      case "a":
        game.self.input.left = true;
        break;
      case "s":
        game.self.input.down = true;
        break;
      case "space":
        game.self.input.jump = true;
        break;
    }
  });

  document.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();

    switch (key) {
      case "w":
        game.self.input.up = !true;
        break;
      case "d":
        game.self.input.right = !true;
        break;
      case "a":
        game.self.input.left = !true;
        break;
      case "s":
        game.self.input.down = !true;
        break;
      case "space":
        game.self.input.jump = !true;
        break;
    }
  });

  return game;
}
