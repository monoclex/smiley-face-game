import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { Size } from "@smiley-face-game/api/schemas/Size";
import Position from "@/math/Position";
import Layer from "@/game/components/layer/Layer";
import Void from "@/game/components/void/Void";
import TileManager from "./TileManager";

export default class World {
  readonly tileManager: TileManager;
  
  readonly decoration: Layer;
  readonly foreground: Layer;
  readonly action: Layer;
  readonly background: Layer;
  readonly void: Void;

  constructor(scene: Phaser.Scene, size: Size) {
    this.tileManager = new TileManager(scene, size);
    this.decoration = new Layer(this.tileManager, "decoration");
    this.foreground = new Layer(this.tileManager, "foreground");
    this.action = new Layer(this.tileManager, "action");
    this.background = new Layer(this.tileManager, "background");
    this.void = new Void(scene, this.tileManager);
  }

  // TODO: put this in something that handles tile layers
  drawLine(layer: TileLayer, start: Position, end: Position, tileId: TileId) {
    
  }
}