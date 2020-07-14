import { TileId } from '@smiley-face-game/api/src/models/TileId';
import { SlotId } from '../../../client/Slot';
import { BlockBarActions, SUPPLY_TEXTURE_LOADER, UPDATE_SELECTED_SLOT } from '../actionTypes/blockBar';

export interface BlockBarState {
  slots: TileId[];
  selected: SlotId;
  loader: ((id: TileId) => Promise<HTMLImageElement>) | null;
}

const initialState: BlockBarState = {
  slots: [TileId.Empty, TileId.Full, TileId.Gun,
  TileId.Gun, TileId.Gun, TileId.Gun, TileId.Gun,
  TileId.Gun, TileId.Gun, TileId.Gun, TileId.Gun,
  TileId.Gun, TileId.Gun
  ],
  selected: null,
  loader: null,
};

export default (state = initialState, action: BlockBarActions): BlockBarState => {
  switch (action.type) {
    case UPDATE_SELECTED_SLOT:
      return {
        ...state,
        selected: action.slot
      };

    case SUPPLY_TEXTURE_LOADER:
      return {
        ...state,
        loader: action.loader
      };

    default: return state;
  }
};