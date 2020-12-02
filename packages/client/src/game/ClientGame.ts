import type { ZSPlayerJoin } from "@smiley-face-game/api/packets";
import type { Connection } from "@smiley-face-game/api";
import { Container, Sprite, Renderer, Texture, DisplayObject, TilingSprite, Rectangle } from "pixi.js";
import { Game, Bullets, Players, Chat, World, Bullet, Player, Size, Inputs } from "./Game";
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
  static connection: Connection;
  sprite: Sprite;
  lastInputs: Inputs;

  constructor(username: string, isGuest: boolean, mainPlayer: boolean) {
    super(username, isGuest, mainPlayer);
    this.sprite = new Sprite(textures.player);
    this.lastInputs = { ...this.input };
  }

  tick() {
    super.tick();
    this.sprite.position.x = this.position.x;
    this.sprite.position.y = this.position.y;

    if (this.mainPlayer) {
      if (!areSame(this.input, this.lastInputs)) {
        ClientPlayer.connection.move(this.position, this.velocity, this.input);
        this.lastInputs = { ...this.input };
      }
    }
  }
}

export class ClientPlayers extends Players {
  constructor(readonly players: Container) {
    super(ClientPlayer);
  }

  addPlayer(joinInfo: ZSPlayerJoin, isMainPlayer?: boolean): ClientPlayer {
    const player = super.addPlayer(joinInfo, isMainPlayer) as ClientPlayer;
    this.players.addChild(player.sprite);
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
  // private readonly background;
  private readonly action: CompositeRectTileLayer & DisplayObject;
  private readonly foreground: CompositeRectTileLayer & DisplayObject;

  constructor(tileJson: TileRegistration, size: Size, worldBehind: Container, worldInfront: Container) {
    super(tileJson, size);
    this.void = new TilingSprite(textures.block("empty"), size.width * 32, size.height * 32);
    this.action = newCompositeRectTileLayer();
    this.foreground = newCompositeRectTileLayer();
    worldBehind.addChild(this.void);
    worldBehind.addChild(this.action);
    worldBehind.addChild(this.foreground);
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

export function makeClientConnectedGame(renderer: Renderer, connection: Connection): Game {
  ClientPlayer.connection = connection;
  const root = new Container();
  const worldBehind = new Container();
  const players = new Container();
  const bullets = new Container();
  const worldInfront = new Container();
  root.addChild(worldBehind); // <-- most behind
  root.addChild(players);
  root.addChild(bullets);
  root.addChild(worldInfront); // <-- closest to viewer

  const display = { draw: () => {} };

  const game = new Game(connection.tileJson, connection.init, (tileJson, init) => [
    new Bullets(ClientBullet),
    new Chat(),
    display,
    new ClientPlayers(players),
    new ClientWorld(tileJson, init.size, worldBehind, worldInfront),
  ]);

  display.draw = () => {
    // calculate position for player to be in the center
    const HALF_PLAYER_SIZE = 16;
    const centerX = -game.self.position.x - HALF_PLAYER_SIZE + renderer.width / 2;
    const centerY = -game.self.position.y - HALF_PLAYER_SIZE + renderer.height / 2;

    // calc some camera lag
    const CAMERA_LAG_MODIFIER = 1 / 16;
    const cameraLagX = (centerX - root.position.x) * CAMERA_LAG_MODIFIER;
    const cameraLagY = (centerY - root.position.y) * CAMERA_LAG_MODIFIER;

    // apply the camera lag
    root.position.x += cameraLagX;
    root.position.y += cameraLagY;
    renderer.render(root);
  };

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
