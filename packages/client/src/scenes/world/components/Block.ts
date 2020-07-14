import { TileId } from '@smiley-face-game/api/src/models/TileId';

// TODO: merge in with libcore?
export class Block {
  constructor(
    public id: TileId,
    public sensor?: MatterJS.BodyType,
  ) { }
}
