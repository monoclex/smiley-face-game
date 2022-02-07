import { Connection, Game } from "@smiley-face-game/api";
import { Player } from "@smiley-face-game/api/physics/Player";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { TileLayer } from "@smiley-face-game/api/types";
import ClientBlockBar from "./ClientBlockBar";

/** Component that gives capabilities for the user sitting at the computer to place blocks. */
export default class AuthoredBlockPlacer {
  constructor(
    private readonly author: Player,
    private readonly connection: Connection,
    private readonly game: Game,
    private readonly blockBar: ClientBlockBar
  ) {}

  // TODO: function signature weird lol
  draw(lastPos: undefined | Vector, curX: number, curY: number, action: "place" | "erase", layer?: TileLayer) {
    const id = action === "erase" ? 0 : this.blockBar.selectedBlock;

    if (!this.author.hasEdit) return;
    layer ??= this.game.blocks.layerOfTopmostBlock(curX, curY);

    const pos = { x: curX, y: curY };
    if (lastPos === undefined) {
      this.connection.place(id, pos, layer);
      this.game.blocks.placeSingle(layer, pos, id, this.author.id);
    } else {
      this.connection.placeLine(id, lastPos, pos, layer);
      this.game.blocks.placeLine(layer, lastPos, pos, id, this.author.id);
    }
  }
}
