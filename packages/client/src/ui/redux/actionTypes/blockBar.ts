import { TileId } from '@smiley-face-game/api/src/schemas/TileId';
import { SlotId } from '../../../client/Slot';

export const UPDATE_SELECTED_SLOT = 'UPDATE_SELECTED_SLOT';
interface UpdateSelectedSlot {
  type: typeof UPDATE_SELECTED_SLOT;
  slot: SlotId;
}

export const SUPPLY_TEXTURE_LOADER = 'SUPPLY_TEXTURE_LOADER';
interface SupplyTextureLoader {
  type: typeof SUPPLY_TEXTURE_LOADER;
  loader: (tile: TileId) => Promise<HTMLImageElement>;
}

export type BlockBarActions =
  | UpdateSelectedSlot
  | SupplyTextureLoader
  ;