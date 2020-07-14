import { TileId } from "@smiley-face-game/api/src/models/TileId";

/**
 * Converts a TileId as represented on the network to the appropriate value for the client.
 * This is necessary, because in the client, the tile with id 0 is the "empty" block. If the empty block is placed in the foreground, it
 * will obstruct the background tiles. There is specifically an "empty" tile (-1/null) which will omit the tile from the layer and allow
 * tiles to be shown behind the current layer. This function makes that conversion.
 * @param tileId The TileId to convert.
 * @returns A number, representing the value of the tile on the client side.
 */
export function toClientTileId(tileId: TileId): number | null {
  if (tileId === TileId.Empty) return null;
  return tileId;
}