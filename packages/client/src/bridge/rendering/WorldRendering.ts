import { CompositeRectTileLayer } from "@pixi/tilemap";
import { Game } from "@smiley-face-game/api";
import { TileLayer } from "@smiley-face-game/api/types";
import { Container, DisplayObject, TilingSprite } from "pixi.js";
import textures from "../textures";

export default class WorldRendering {
  readonly worldBehind: Container = new Container();
  readonly worldInfront: Container = new Container();

  private dirty = true;

  private readonly void: TilingSprite;
  private readonly background: CompositeRectTileLayer & DisplayObject;
  private readonly action: CompositeRectTileLayer & DisplayObject;
  private readonly foreground: CompositeRectTileLayer & DisplayObject;
  private readonly decoration: CompositeRectTileLayer & DisplayObject;

  constructor(readonly game: Game) {
    this.void = new TilingSprite(textures.block("empty"), game.blocks.size.x * 32, game.blocks.size.y * 32);
    this.background = new CompositeRectTileLayer();
    this.action = new CompositeRectTileLayer();
    this.foreground = new CompositeRectTileLayer();
    this.decoration = new CompositeRectTileLayer();
    this.worldBehind.addChild(this.void);
    this.worldBehind.addChild(this.background);
    this.worldBehind.addChild(this.action);
    this.worldBehind.addChild(this.foreground);
    this.worldInfront.addChild(this.decoration);

    game.blocks.events.on("block", () => (this.dirty = true));
    game.blocks.events.on("load", () => (this.dirty = true));
  }

  draw() {
    if (this.dirty) {
      this.refresh();
    }
  }

  refresh() {
    // TODO: the reason we clear the world is because there's some fun fiddlyness
    // regarding placing the empty tile atop over arrow tiles and whatnot

    this.foreground.clear();
    this.decoration.clear();
    this.action.clear();
    this.load(this.game.blocks.state);
  }

  load(blocks: number[][][]) {
    this.action.clear();
    this.foreground.clear();

    const map = {
      [TileLayer.Foreground]: this.foreground,
      [TileLayer.Action]: this.action,
      [TileLayer.Background]: undefined,
      [TileLayer.Decoration]: undefined,
    };

    for (let layerIdx = TileLayer.Foreground; layerIdx <= TileLayer.Decoration; layerIdx++) {
      const layer = blocks[layerIdx];
      const tileLayer: (CompositeRectTileLayer & DisplayObject) | undefined = map[layerIdx];
      if (tileLayer === undefined) continue;
      for (let yIdx = 0; yIdx < this.game.blocks.size.y; yIdx++) {
        const y = layer[yIdx];
        for (let x = 0; x < this.game.blocks.size.x; x++) {
          // because we've cleared the world, we don't want to place an empty tile
          // when we already have an *actual* empty tile
          if (y[x] === 0) continue;
          const textureName = this.mapTextureName(this.game.tiles.texture(y[x]));
          tileLayer.addFrame(textures.block(textureName), x * 32, yIdx * 32);
        }
      }
    }
  }

  mapTextureName(name: string): string {
    // TODO: there's got to be a better way to render different tiles depending
    //   on if the key is pressed or not
    if (this.game.physics.redKeyOn) {
      if (name === "keys-red-door") return "keys-red-gate";
      if (name === "keys-red-gate") return "keys-red-door";
    }
    return name;
  }
}