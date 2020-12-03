import type { ZSInit, ZSPlayerJoin } from "@smiley-face-game/api/packets";
import type { Connection } from "@smiley-face-game/api";
import { Container, Sprite, Renderer, Texture, DisplayObject, TilingSprite, Rectangle, resources } from "pixi.js";
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
  Position,
} from "./Game";
import playerUrl from "../assets/base.png";
import bulletUrl from "../assets/bullet.png";
import atlasUrl from "../assets/atlas.png";
import selectUrl from "../assets/select.png";
import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import { CompositeRectTileLayer } from "pixi-tilemap";
import atlasJson from "../assets/atlas_atlas.json";
import { TileLayer } from "@smiley-face-game/api/types";
import { blockbar } from "../recoil/atoms/blockbar";
import { loading } from "../recoil/atoms/loading";
import { playerList } from "../recoil/atoms/playerList";
import { bresenhamsLine } from "@smiley-face-game/api/misc";

function newCompositeRectTileLayer(zIndex?: number, bitmaps?: any[]): CompositeRectTileLayer & DisplayObject {
  // for some reason, pixi-tilemap compositerecttilelayers are valid
  // DisplayObjects but because pixi-tilemap imports @pixi/things instead of
  // pixi.js, it doesn't have valid typings for whatever reason... hacky
  // workarounds ftw!
  // @ts-ignore
  return new CompositeRectTileLayer(zIndex, bitmaps);
}

export const textures = new (class {
  private _tileJson: TileRegistration | undefined;
  get tileJson(): TileRegistration {
    if (!this._tileJson) throw new Error("`tileJson` not loaded");
    return this._tileJson;
  }

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

  private _select: Texture | undefined;
  get select(): Texture {
    if (!this._select) throw new Error("`select` texture not loaded");
    return this._select;
  }

  private readonly _blockCache: Map<string, Texture> = new Map();
  block(name: number | string): Texture {
    if (typeof name === "number") {
      return this.block(this.tileJson.texture(name));
    }

    const blockCacheResult = this._blockCache.get(name);
    if (blockCacheResult !== undefined) {
      return blockCacheResult;
    }

    // TODO: move atlas json stuff to its own component
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

  load(tileJson: TileRegistration): Promise<void> {
    //@ts-ignore
    window.HACK_FIXME_LATER_tileJson = tileJson;
    this._tileJson = tileJson;
    return Promise.all([playerUrl, bulletUrl, atlasUrl, selectUrl])
      .then((urls) => Promise.all(urls.map(Texture.fromURL)))
      .then(([player, bullet, atlas, select]) => {
        this._player = player;
        this._bullet = bullet;
        this._atlas = atlas;
        this._select = select;
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

  constructor(id: number, username: string, isGuest: boolean) {
    super(id, username, isGuest);
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
    playerList.modify({
      players: [
        ...playerList.state.players,
        {
          playerId: player.id,
          role: player.role,
          username: player.username,
        },
      ],
    });
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
      const tileLayer: (CompositeRectTileLayer & DisplayObject) | undefined = map[layerIdx];
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

  placeBlock(author: Player, x: number, y: number, id: number, layer?: number) {
    super.placeBlock(author, x, y, id, layer);
    this.foreground.clear();
    this.decoration.clear();
    this.load(this.state);
  }

  placeLine(author: Player, x1: number, y1: number, x2: number, y2: number, id: number, layer?: number) {
    super.placeLine(author, x1, y1, x2, y2, id, layer);
    this.foreground.clear();
    this.decoration.clear();
    this.load(this.state);
  }

  onPlace(layer: TileLayer, y: number, x: number, id: number) {
    const map = {
      [TileLayer.Foreground]: this.foreground,
      [TileLayer.Action]: this.action,
    };

    //@ts-ignore
    map[layer].addFrame(textures.block(id), x * 32, y * 32);
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

enum MouseState {
  None,
  Place,
  Erase,
  WasPlacingNowErasing,
  WasErasingNowPlacing,
}

/** Component that gives capabilities for the user sitting at the computer to place blocks. */
export class AuthoredBlockPlacer {
  constructor(
    private readonly author: Player,
    private readonly connection: Connection,
    private readonly world: World,
    private readonly blockBar: ClientBlockBar
  ) {}

  // TODO: function signature weird lol
  draw(lastPos: undefined | Position, curX: number, curY: number, action: "place" | "erase", layer?: TileLayer) {
    const id = action === "erase" ? 0 : this.blockBar.selectedBlock;

    if (lastPos === undefined) {
      this.connection.place(id, { x: curX, y: curY }, layer);
      this.world.placeBlock(this.author, curX, curY, id, layer);
    } else {
      this.connection.placeLine(id, lastPos, { x: curX, y: curY }, layer);
      this.world.placeLine(this.author, lastPos.x, lastPos.y, curX, curY, id, layer);
    }
  }
}

export class ClientSelector {
  readonly selection: Sprite = new Sprite(textures.select);
  private mousePos: Position = { x: 0, y: 0 };
  private state: MouseState = MouseState.None;
  private lastPlacePos: Position | undefined;

  constructor(
    private readonly root: Container,
    private readonly authoredBlockPlacer: AuthoredBlockPlacer,
    private readonly world: World
  ) {
    // TODO: should we *really* be adding something to the root container?
    root.addChild(this.selection);

    document.addEventListener("mousemove", (event) => {
      this.mousePos.x = event.clientX;
      this.mousePos.y = event.clientY;
    });

    document.addEventListener("mousedown", this.handleClick.bind(this));
    document.addEventListener("mouseup", this.handleClick.bind(this));
  }

  handleClick(event: MouseEvent) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    const MOUSE_PRIMARY = 1;
    const MOUSE_SECONDARY = 2;

    const doPlace = (event.buttons & MOUSE_PRIMARY) != 0;
    const doErase = (event.buttons & MOUSE_SECONDARY) != 0;

    // TODO: yikers!
    switch (this.state) {
      case MouseState.None:
        // this is a rare edge case, just set it to sommething
        if (doPlace && doErase) this.state = MouseState.WasErasingNowPlacing;
        else if (doPlace) this.state = MouseState.Place;
        else if (doErase) this.state = MouseState.Erase;
        break;
      case MouseState.Place:
        if (!doPlace) this.state = doErase ? MouseState.Erase : MouseState.None;
        else this.state = doErase ? MouseState.WasPlacingNowErasing : MouseState.Place;
        break;
      case MouseState.Erase:
        if (!doErase) this.state = doPlace ? MouseState.Place : MouseState.None;
        else this.state = doPlace ? MouseState.WasErasingNowPlacing : MouseState.Erase;
        break;
      case MouseState.WasPlacingNowErasing:
        if (doPlace) this.state = doErase ? MouseState.WasPlacingNowErasing : MouseState.Place;
        else this.state = doErase ? MouseState.Erase : MouseState.None;
        break;
      case MouseState.WasErasingNowPlacing:
        if (doErase) this.state = doPlace ? MouseState.WasErasingNowPlacing : MouseState.Erase;
        else this.state = doPlace ? MouseState.Place : MouseState.None;
        break;
    }
  }

  tick() {
    const mouseWorldX = -this.root.position.x + this.mousePos.x;
    const mouseWorldY = -this.root.position.y + this.mousePos.y;

    const TILE_WIDTH = 32;
    const TILE_HEIGHT = 32;
    let mouseBlockX = Math.floor(mouseWorldX / TILE_WIDTH);
    let mouseBlockY = Math.floor(mouseWorldY / TILE_HEIGHT);

    // TODO: everything below here do be kinda ugly doe
    mouseBlockX = mouseBlockX < 0 ? 0 : mouseBlockX >= this.world.size.width ? this.world.size.width - 1 : mouseBlockX;
    mouseBlockY =
      mouseBlockY < 0 ? 0 : mouseBlockY >= this.world.size.height ? this.world.size.height - 1 : mouseBlockY;

    this.selection.position.x = mouseBlockX * TILE_WIDTH;
    this.selection.position.y = mouseBlockY * TILE_HEIGHT;

    if (this.state === MouseState.Place || this.state === MouseState.WasErasingNowPlacing) {
      this.authoredBlockPlacer.draw(this.lastPlacePos, mouseBlockX, mouseBlockY, "place");
      this.lastPlacePos = { x: mouseBlockX, y: mouseBlockY };
    } else if (this.state === MouseState.Erase || this.state === MouseState.WasPlacingNowErasing) {
      // TODO: figure out layer to erase on
      this.authoredBlockPlacer.draw(this.lastPlacePos, mouseBlockX, mouseBlockY, "erase");
      this.lastPlacePos = { x: mouseBlockX, y: mouseBlockY };
    } else this.lastPlacePos = undefined;
  }
}

export class ClientDisplay implements Display {
  readonly root: Container = new Container();
  readonly worldBehind: Container = new Container();
  readonly players: Container = new Container();
  readonly bullets: Container = new Container();
  readonly worldInfront: Container = new Container();
  private mouse: Position = { x: 0, y: 0 };

  constructor(private readonly renderer: Renderer) {
    // <-- most behind
    this.root.addChild(this.worldBehind);
    this.root.addChild(this.players);
    this.root.addChild(this.bullets);
    this.root.addChild(this.worldInfront);
    // selection gets added here too (in `ClientSelector`)
    // <-- closest to viewer
  }

  draw(game: Game): void {
    this.updateCameraView(game);
    this.renderer.render(this.root);
  }

  updateCameraView(game: Game) {
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
  }
}

export class ClientBlockBar {
  constructor(private readonly tileJson: TileRegistration) {
    blockbar.modify({
      // TODO: maybe this could be an instance method on this class instead?
      loader: async (id) => {
        const textureName = tileJson.texture(id);
        const textureFrame = find(textureName);

        const resource = textures.block(id).baseTexture.resource;
        if (!(resource instanceof resources.BaseImageResource)) {
          throw new Error("atlas not png, huh?");
        }

        if ("ownerSVGElement" in resource.source) {
          throw new Error("cant use svg as resource");
        }

        const TILE_WIDTH = 32;
        const TILE_HEIGHT = 32;
        const renderImageCanvas = document.createElement("canvas");
        renderImageCanvas.width = TILE_WIDTH;
        renderImageCanvas.height = TILE_HEIGHT;

        const context = renderImageCanvas.getContext("2d")!;

        const { x, y, w: width, h: height } = textureFrame.frame;
        context.drawImage(resource.source, x, y, width, height, 0, 0, TILE_WIDTH, TILE_HEIGHT);

        const blob = await new Promise((resolve) => renderImageCanvas.toBlob(resolve));
        const url = URL.createObjectURL(blob);

        const tileTexture = new Image();
        tileTexture.src = url;
        return tileTexture;
      },
      slots: {
        ...blockbar.state.slots,
        [0]: tileJson.id("empty"),
        [1]: tileJson.id("basic-white"),
        [2]: tileJson.id("gun"),
        [3]: tileJson.id("arrow-up"),
        [4]: tileJson.id("prismarine-basic"),
        [5]: tileJson.id("gemstone-red"),
        [6]: tileJson.id("tshell-white"),
        [7]: tileJson.id("pyramid-white"),
        [8]: tileJson.id("choc-l0"),
      },
    });

    function find(textureName: string) {
      // TODO: move atlas json stuff to its own component
      for (const frame of atlasJson.frames) {
        if (frame.filename === textureName) {
          return frame;
        }
      }
      throw new Error("couldn't find texture " + textureName);
    }
  }

  get selectedBlock(): number {
    return blockbar.state.slots[blockbar.state.selected];
  }
}

export class Keyboard {
  constructor(player: Player) {
    // TODO: do this nicely? (inside of ClientGame)
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      switch (key) {
        case "w":
          player.input.up = true;
          break;
        case "d":
          player.input.right = true;
          break;
        case "a":
          player.input.left = true;
          break;
        case "s":
          player.input.down = true;
          break;
        case "space":
          player.input.jump = true;
          break;
      }
    });

    document.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();

      switch (key) {
        case "w":
          player.input.up = !true;
          break;
        case "d":
          player.input.right = !true;
          break;
        case "a":
          player.input.left = !true;
          break;
        case "s":
          player.input.down = !true;
          break;
        case "space":
          player.input.jump = !true;
          break;
      }
    });
  }
}

export class ClientGame extends Game {
  readonly authoredBlockPlacer: AuthoredBlockPlacer;
  readonly blockBar: ClientBlockBar;
  readonly connection: Connection;
  readonly display: ClientDisplay;
  readonly keyboard: Keyboard;
  readonly network: ClientNetwork;
  readonly renderer: Renderer;
  readonly selector: ClientSelector;

  constructor(tileJson: TileRegistration, init: ZSInit, renderer: Renderer, connection: Connection) {
    const display = new ClientDisplay(renderer);
    const network = new ClientNetwork(connection);

    super(tileJson, init, () => [
      new Bullets(ClientBullet),
      new Chat(),
      new ClientPlayers(display.players),
      new ClientWorld(tileJson, init.size, display.worldBehind, display.worldInfront),
    ]);

    this.connection = connection;
    this.renderer = renderer;
    this.blockBar = new ClientBlockBar(connection.tileJson);
    this.display = display;
    this.keyboard = new Keyboard(this.self);
    this.network = network;
    this.authoredBlockPlacer = new AuthoredBlockPlacer(this.self, this.connection, this.world, this.blockBar);
    this.selector = new ClientSelector(this.display.root, this.authoredBlockPlacer, this.world);

    for (const playerInfo of connection.init.players) {
      this.players.addPlayer(playerInfo);
    }

    (async () => {
      for await (const message of connection) {
        this.handle(message);
      }
    })();
  }

  tick(deltaMs: number) {
    super.tick(deltaMs);

    this.selector.tick();
    this.display.draw(this);
    this.network.update(this);
  }
}

export function makeClientConnectedGame(renderer: Renderer, connection: Connection): ClientGame {
  //@ts-ignore
  window.HACK_FIX_LATER_selfId = connection.init.playerId;

  const game = new ClientGame(connection.tileJson, connection.init, renderer, connection);

  loading.set({ failed: false });

  return game;
}
