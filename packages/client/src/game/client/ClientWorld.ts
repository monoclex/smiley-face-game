import { Container, DisplayObject, TilingSprite } from "pixi.js";
import World from "../World";
import Player from "../Player";
import Size from "../interfaces/Size";
import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import { CompositeRectTileLayer } from "@pixi/tilemap";
import { TileLayer } from "@smiley-face-game/api/types";
import textures from "../textures";

export default class ClientWorld extends World {
  private readonly void: TilingSprite;
  private readonly background: CompositeRectTileLayer & DisplayObject;
  private readonly action: CompositeRectTileLayer & DisplayObject;
  private readonly foreground: CompositeRectTileLayer & DisplayObject;
  private readonly decoration: CompositeRectTileLayer & DisplayObject;

  constructor(tileJson: TileRegistration, size: Size, worldBehind: Container, worldInfront: Container) {
    super(tileJson, size);
    this.void = new TilingSprite(textures.block("empty"), size.width * 32, size.height * 32);
    this.background = new CompositeRectTileLayer();
    this.action = new CompositeRectTileLayer();
    this.foreground = new CompositeRectTileLayer();
    this.decoration = new CompositeRectTileLayer();
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
      [TileLayer.Background]: undefined,
      [TileLayer.Decoration]: undefined,
    };

    for (let layerIdx = TileLayer.Foreground; layerIdx <= TileLayer.Decoration; layerIdx++) {
      const layer = blocks[layerIdx];
      const tileLayer: (CompositeRectTileLayer & DisplayObject) | undefined = map[layerIdx];
      if (tileLayer === undefined) continue;
      for (let yIdx = 0; yIdx < this.size.height; yIdx++) {
        const y = layer[yIdx];
        for (let x = 0; x < this.size.width; x++) {
          // because we've cleared the world, we don't want to place an empty tile
          // when we already have an *actual* empty tile
          if (y[x] === 0) continue;
          const textureName = this.mapTextureName(this.tileJson.texture(y[x]));
          tileLayer.addFrame(textures.block(textureName), x * 32, yIdx * 32);
        }
      }
    }
  }

  mapTextureName(name: string): string {
    // TODO: there's got to be a better way to render different tiles depending
    //   on if the key is pressed or not
    if (this.redKeyTouched) {
      if (name === "keys-red-door") return "keys-red-gate";
      if (name === "keys-red-gate") return "keys-red-door";
    }
    return name;
  }

  refresh() {
    // TODO: the reason we clear the world is because there's some fun fiddlyness
    // regarding placing the empty tile atop over arrow tiles and whatnot

    this.foreground.clear();
    this.decoration.clear();
    this.action.clear();
    this.load(this.state);
  }

  placeBlock(author: Player, x: number, y: number, id: number, layer?: number) {
    super.placeBlock(author, x, y, id, layer);
    this.refresh();
  }

  placeLine(author: Player, x1: number, y1: number, x2: number, y2: number, id: number, layer?: number) {
    super.placeLine(author, x1, y1, x2, y2, id, layer);
    this.refresh();
  }

  onPlace(layer: TileLayer, y: number, x: number, id: number) {
    const map = {
      [TileLayer.Foreground]: this.foreground,
      [TileLayer.Action]: this.action,
      [TileLayer.Background]: undefined,
      [TileLayer.Decoration]: undefined,
    };

    const pixiLayer = map[layer];
    if (pixiLayer === undefined) throw new Error("cannot onPlace");

    pixiLayer.addFrame(textures.block(id), x * 32, y * 32);
  }

  toggleKeyTouched(kind: "red", isTouched: boolean): void {
    super.toggleKeyTouched(kind, isTouched);
    this.refresh();
  }
}
