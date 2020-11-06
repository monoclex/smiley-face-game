import { TileId, TileLayer, PrismarineVariant } from "@smiley-face-game/common/types";
import type { ZBlock } from "@smiley-face-game/common/types";
import Tile from "./Tile";
import mapTileNameToClientId from "./idLookup";
import RenderCanvasParams from "./RenderCanvasParams";

export default class PrismarineTile implements Tile<TileId.Prismarine> {
  id: TileId.Prismarine = TileId.Prismarine;
  layer: TileLayer = TileLayer.Foreground;

  place(tile: Phaser.Tilemaps.Tile, tileState: ZBlock & { id: TileId.Prismarine }): void {
    tile.setCollision(true);
    tile.index = this.index(tileState.variant);
  }

  renderCanvas({ getFrame, context, block }: RenderCanvasParams<TileId.Prismarine>) {
    const { x, y, width, height, atlas } = getFrame(this.index(block.variant));
    context.drawImage(atlas, x, y, width, height, 0, 0, 32, 32);
  }

  private index(variant: PrismarineVariant): number {
    const lookup = {
      [PrismarineVariant.Anchor]: "prismarine-anchor",
      [PrismarineVariant.Basic]: "prismarine-basic",
      [PrismarineVariant.Brick]: "prismarine-brick",
      [PrismarineVariant.Crystal]: "prismarine-crystal",
      [PrismarineVariant.Slab]: "prismarine-slab",
    };

    return mapTileNameToClientId(lookup[variant]);
  }
}
