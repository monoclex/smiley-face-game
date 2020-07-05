import { SlotId } from '../../../client/Slot';
import { TileId } from '../../../libcore/core/models/TileId';
import { BlockBarActions, UPDATE_SELECTED_SLOT } from '../actionTypes/blockBar';

export interface BlockBarState {
  slots: TileId[];
  selected: SlotId;
}

const initialState: BlockBarState = {
  slots: [TileId.Empty, TileId.Full, TileId.Gun,
    TileId.Gun, TileId.Gun, TileId.Gun, TileId.Gun,
    TileId.Gun, TileId.Gun, TileId.Gun, TileId.Gun,
    TileId.Gun, TileId.Gun
  ],
  selected: null
};

export default (state = initialState, action: BlockBarActions): BlockBarState => {
  switch (action.type) {
    case UPDATE_SELECTED_SLOT:
      return {
        ...state,
        selected: action.slot
      };
    
    default: return state;
  }
}