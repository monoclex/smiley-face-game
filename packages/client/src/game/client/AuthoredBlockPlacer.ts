import { Connection } from "@smiley-face-game/api";
import World from "../World";
import Player from "../Player";
import Position from "../interfaces/Position";
import { TileLayer } from "@smiley-face-game/api/types";
import ClientBlockBar from "./ClientBlockBar";

/** Component that gives capabilities for the user sitting at the computer to place blocks. */
export default class AuthoredBlockPlacer {
  constructor(
    private readonly author: Player,
    private readonly connection: Connection,
    private readonly world: World,
    private readonly blockBar: ClientBlockBar
  ) {}

  // TODO: function signature weird lol
  draw(lastPos: undefined | Position, curX: number, curY: number, action: "place" | "erase", layer?: TileLayer) {
    const id = action === "erase" ? 0 : this.blockBar.selectedBlock;

    if (!this.author.hasEdit) return;

    if (lastPos === undefined) {
      this.connection.place(id, { x: curX, y: curY }, layer);
      this.world.placeBlock(this.author, curX, curY, id, layer);
    } else {
      this.connection.placeLine(id, lastPos, { x: curX, y: curY }, layer);
      this.world.placeLine(this.author, lastPos.x, lastPos.y, curX, curY, id, layer);
    }
  }
}
