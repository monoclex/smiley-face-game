import { TileId } from "../../../api/src/schemas/TileId";

/**
 * The class primarily responsible for soley all room logic.
 */
export default class RoomLogic {
  readonly onCompletion: Promise<void>;
  
  readonly #blocks: { id: TileId }[][][];

  constructor(blocks: { id: TileId }[][][]) {
    this.#blocks = blocks;
  }
}