import type Phaser from "phaser";
import type { ZBlock } from "@smiley-face-game/api/types";
import type Player from "./game/player/Player";

export declare class TileEx extends Phaser.Tilemaps.Tile {
  tileState?: ZBlock;
}

export declare class SpriteEx extends Phaser.GameObjects.Sprite {
  player?: Player;
}
