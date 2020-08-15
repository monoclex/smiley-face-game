import { TileId } from '@smiley-face-game/api/schemas/TileId';

// TODO: merge in with libcore?
export class Block {
  constructor(
    public id: TileId,
    public sensor?: MatterJS.BodyType,
  ) { }
}
