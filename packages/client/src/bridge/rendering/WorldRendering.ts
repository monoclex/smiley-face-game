import { CompositeRectTileLayer } from "@pixi/tilemap";
import { Game } from "@smiley-face-game/api";
import { Player } from "@smiley-face-game/api/physics/Player";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { TileLayer, ZKeyKind } from "@smiley-face-game/api/types";
import { Container, DisplayObject, TilingSprite } from "pixi.js";
import textures from "../textures";

export default class WorldRendering {
  readonly worldBehind: Container = new Container();
  readonly worldInfront: Container = new Container();

  self!: Player;
  private dirty = true;
  private onCheckpoint: Vector | null = null;

  private readonly void: TilingSprite;
  private readonly background: CompositeRectTileLayer & DisplayObject;
  private readonly action: CompositeRectTileLayer & DisplayObject;
  private readonly foreground: CompositeRectTileLayer & DisplayObject;
  private readonly decoration: CompositeRectTileLayer & DisplayObject;

  constructor(readonly game: Game) {
    this.void = new TilingSprite(
      textures.block("empty"),
      game.blocks.size.x * 32,
      game.blocks.size.y * 32
    );

    this.background = new CompositeRectTileLayer();
    this.action = new CompositeRectTileLayer();
    this.foreground = new CompositeRectTileLayer();
    this.decoration = new CompositeRectTileLayer();
    this.worldBehind.addChild(this.void);
    this.worldBehind.addChild(this.background);
    this.worldBehind.addChild(this.action);
    this.worldBehind.addChild(this.foreground);
    this.worldInfront.addChild(this.decoration);

    const dirty = this.flagDirty.bind(this);
    game.blocks.events.on("block", dirty);
    game.blocks.events.on("load", dirty);
    game.physics.events.on("keyState", dirty);
    game.physics.events.on("keyTouch", dirty);
  }

  flagDirty() {
    this.dirty = true;
  }

  draw() {
    if (this.dirty) {
      this.refresh();
      this.dirty = false;
    }
  }

  refresh() {
    // TODO: the reason we clear the world is because there's some fun fiddlyness
    // regarding placing the empty tile atop over arrow tiles and whatnot

    this.foreground.clear();
    this.decoration.clear();
    this.action.clear();
    this.load(this.game.blocks.state.state);
  }

  turnOnCheckpoint(pos: Vector) {
    this.onCheckpoint = pos;
    this.flagDirty();
  }

  load(blocks: number[][][]) {
    this.action.clear();
    this.foreground.clear();

    const map = {
      [TileLayer.Foreground]: this.foreground,
      [TileLayer.Action]: this.action,
      [TileLayer.Background]: undefined,
      [TileLayer.Decoration]: this.decoration,
    };

    const keysOn = this.game.physics.getAllKeysOn(this.self);

    for (let layerIdx = TileLayer.Foreground; layerIdx <= TileLayer.Decoration; layerIdx++) {
      const layer = blocks[layerIdx];
      if (layer === undefined || layer === null) continue;
      const tileLayer: (CompositeRectTileLayer & DisplayObject) | undefined = map[layerIdx];
      if (!tileLayer) continue;
      for (let yIdx = 0; yIdx < this.game.blocks.size.y; yIdx++) {
        const y = layer[yIdx];
        if (y === undefined || y === null) continue;
        for (let x = 0; x < this.game.blocks.size.x; x++) {
          // because we've cleared the world, we don't want to place an empty tile
          // when we already have an *actual* empty tile
          if (y[x] === 0 || y[x] === null || y[x] === undefined) continue;

          const pos = new Vector(x, yIdx);
          const textureName = this.mapTextureName(keysOn, this.game.tiles.texture(y[x]), pos);

          tileLayer.addFrame(textures.block(textureName), x * 32, yIdx * 32);
        }
      }
    }
  }

  mapTextureName(keysOn: ZKeyKind[], name: string, pos: Vector): string {
    // TODO: there's got to be a better way to render different tiles depending
    //   on if the key is pressed or not

    for (const keyOn of keysOn) {
      if (name === `keys-${keyOn}-door`) return `keys-${keyOn}-gate`;
      if (name === `keys-${keyOn}-gate`) return `keys-${keyOn}-door`;
      if (name === `keys-${keyOn}-key`) return `keys-${keyOn}-key-on`;
    }

    if (this.onCheckpoint) {
      if (name === "spike-checkpoint" && Vector.eq(this.onCheckpoint, pos)) {
        return "checkpoint-on";
      }
    }

    return name;
  }
}
