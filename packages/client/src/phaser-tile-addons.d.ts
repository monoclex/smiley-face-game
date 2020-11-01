import type Phaser from "phaser";
import type TileState from "@smiley-face-game/common/tiles/TileState";
import type Player from "./game/player/Player";

export declare class TileEx extends Phaser.Tilemaps.Tile {
  tileState?: TileState;
}

export declare class SpriteEx extends Phaser.GameObjects.Sprite {
  player?: Player;
}
