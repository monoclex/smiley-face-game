import { TileId } from '../../../libcore/core/models/TileId';

// TODO: merge in with libcore?
export class Block {
  constructor(
    public id: TileId,
    public sensor?: MatterJS.BodyType,
  ) {}
}
