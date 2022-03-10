import { Connection, Game } from "@smiley-face-game/api";
import { bresenhamsLine } from "@smiley-face-game/api/misc";
import { Player } from "@smiley-face-game/api/physics/Player";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { HeapKind } from "@smiley-face-game/api/tiles/TileRegistration";
import { TileLayer, ZHeap } from "@smiley-face-game/api/types";
import ClientBlockBar from "./ClientBlockBar";
import placements from "./placement";

/** Component that gives capabilities for the user sitting at the computer to place blocks. */
export default class AuthoredBlockPlacer {
  constructor(
    private readonly author: Player,
    private readonly connection: Connection,
    private readonly game: Game,
    private readonly blockBar: ClientBlockBar
  ) {}

  get canEdit(): boolean {
    return this.author.hasEdit;
  }

  place(layer: TileLayer, lastPos: undefined | Vector, pos: Vector, id: number, heap?: ZHeap) {
    if (id == 116 || id == 117 || id == 118) {
      heap = { kind: "switch", id: 1 };
    }

    if (lastPos === undefined) {
      const didModify = this.game.blocks.placeSingle(layer, pos, id, this.author.id, heap);
      if (didModify) this.connection.place(id, pos, heap, layer);
    } else {
      const didModify = this.game.blocks.placeLine(layer, lastPos, pos, id, this.author.id, heap);
      if (didModify) this.connection.placeLine(id, lastPos, pos, heap, layer);
    }
  }

  // TODO: function signature weird lol
  draw(
    lastPos: undefined | Vector,
    curX: number,
    curY: number,
    action: "place" | "erase",
    layer?: TileLayer
  ) {
    const id = action === "erase" ? 0 : this.blockBar.selectedBlock;

    if (!this.author.hasEdit) return;
    const blockInfo = this.game.tiles.forId(id);
    layer ??= blockInfo.preferredLayer;

    const pos = { x: curX, y: curY };
    this.place(layer, lastPos, pos, id);

    const heapKind = blockInfo.heap;
    if (heapKind !== HeapKind.None) {
      if (lastPos === undefined) {
        placements[heapKind](this.game, this, layer, pos, id, this.author);
      } else {
        const layer2 = layer;
        bresenhamsLine(lastPos.x, lastPos.y, pos.x, pos.y, (x, y) => {
          if (x >= 0 && y >= 0 && x < this.game.blocks.size.x && y < this.game.blocks.size.y) {
            placements[heapKind](this.game, this, layer2, { x, y }, id, this.author);
          }
        });
      }
    }
  }
}
